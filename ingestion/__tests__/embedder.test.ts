import axios from "axios";
import { generateEmbedding } from "../embedder";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("embedder", () => {
  it("should successfully generate embedding via HF API", async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    mockedAxios.post.mockResolvedValueOnce({
      data: mockEmbedding,
    });

    const result = await generateEmbedding("test text");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        inputs: "test text",
      }),
      expect.any(Object)
    );
    expect(result).toEqual(mockEmbedding);
  });

  it("should handle error when API fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("API Error"));

    await expect(generateEmbedding("test text")).rejects.toThrow("API Error");
  });
});
