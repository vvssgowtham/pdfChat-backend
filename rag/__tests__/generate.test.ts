import axios from "axios";
import { chatCompletions } from "../generate";
import { Response } from "express";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("chatCompletions", () => {
  let mockRes: Partial<Response>;
  let mockPipe: jest.Mock;
  let mockOn: jest.Mock;

  beforeEach(() => {
    mockPipe = jest.fn();
    mockOn = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
      headersSent: false,
    };
    jest.clearAllMocks();
  });

  it("should successfully call HF API and pipe response", async () => {
    const mockStream = {
      pipe: mockPipe,
      on: mockOn,
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: mockStream,
    });

    await chatCompletions(["chunk1"], "query", mockRes as Response);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user" }),
        ]),
        stream: true,
      }),
      expect.any(Object)
    );
    expect(mockPipe).toHaveBeenCalledWith(mockRes);
    expect(mockOn).toHaveBeenCalledWith("end", expect.any(Function));
  });

  it("should handle axios errors", async () => {
    const error = new Error("API Error");
    mockedAxios.post.mockRejectedValueOnce(error);

    await chatCompletions(["chunk1"], "query", mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to generate response from LLM",
    });
  });

  it("should handle axios response errors with details", async () => {
    const mockErrorData = {
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === "data") {
          cb(Buffer.from("API detailed error"));
        }
      }),
    };

    const axiosError = {
      isAxiosError: true,
      message: "Axios Error",
      response: {
        data: mockErrorData,
      },
    };

    mockedAxios.isAxiosError.mockReturnValueOnce(true);
    mockedAxios.post.mockRejectedValueOnce(axiosError);

    await chatCompletions(["chunk1"], "query", mockRes as Response);

    expect(mockErrorData.on).toHaveBeenCalledWith("data", expect.any(Function));
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
