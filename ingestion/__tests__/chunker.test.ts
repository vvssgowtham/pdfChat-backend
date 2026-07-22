import { chunkText, normalizeText, ChunkInputMetadata } from "../chunker";

describe("chunker", () => {
  describe("normalizeText", () => {
    it("should remove carriage returns", () => {
      expect(normalizeText("hello\rworld")).toBe("helloworld");
    });

    it("should collapse multiple newlines", () => {
      expect(normalizeText("hello\n\n\n\nworld")).toBe("hello\n\nworld");
    });

    it("should collapse multiple spaces and tabs", () => {
      expect(normalizeText("hello   \t   world")).toBe("hello world");
    });
  });

  describe("chunkText", () => {
    const mockMetadata: ChunkInputMetadata = {
      documentId: "doc123",
      filename: "test.pdf",
      totalPages: 10,
    };

    it("should split text into chunks based on size and overlap", () => {
      const text =
        "This is a long text that should be split into multiple chunks for processing.";
      // chunkSize 20, overlap 5 -> stepSize 15
      const chunks = chunkText(text, mockMetadata, {
        chunkSize: 20,
        overlap: 5,
      });

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].content.length).toBeLessThanOrEqual(20);
      expect(chunks[0].documentId).toBe("doc123");
      expect(chunks[0].metadata.filename).toBe("test.pdf");
    });

    it("should throw error if overlap is greater than or equal to chunkSize", () => {
      expect(() => {
        chunkText("some text", mockMetadata, { chunkSize: 10, overlap: 10 });
      }).toThrow("Overlap must be smaller than chunk size");
    });

    it("should handle empty or whitespace-only text", () => {
      const chunks = chunkText("   ", mockMetadata, {
        chunkSize: 10,
        overlap: 2,
      });
      expect(chunks).toEqual([]);
    });

    it("should generate a valid checksum for each chunk", () => {
      const text = "Checksum test text content";
      const chunks = chunkText(text, mockMetadata, {
        chunkSize: 100,
        overlap: 0,
      });
      expect(chunks[0].checksum).toHaveLength(64); // SHA-256 hex length
    });
  });
});
