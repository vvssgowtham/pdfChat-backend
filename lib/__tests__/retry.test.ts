import axios from "axios";
import { isRetryableError, withRetry } from "../retry";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("retry helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("does not retry plain errors", () => {
    expect(isRetryableError(new Error("boom"))).toBe(false);
  });

  it("retries 429 responses and succeeds", async () => {
    jest.useFakeTimers();
    mockedAxios.isAxiosError.mockReturnValue(true);

    const operation = jest
      .fn()
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 429, headers: {} },
      })
      .mockResolvedValueOnce("done");

    const promise = withRetry(operation);
    await jest.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe("done");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting attempts", async () => {
    jest.useFakeTimers();
    mockedAxios.isAxiosError.mockReturnValue(true);

    const operation = jest.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 429, headers: {} },
    });

    const promise = withRetry(operation, 3);
    promise.catch(() => undefined);
    await jest.advanceTimersByTimeAsync(1000 + 2000);

    await expect(promise).rejects.toMatchObject({
      response: { status: 429 },
    });
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
