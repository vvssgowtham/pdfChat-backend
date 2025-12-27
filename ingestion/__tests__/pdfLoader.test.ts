describe("pdfLoader", () => {
  let parsePdf: any;
  let mockMistralInstance: any;

  beforeEach(() => {
    jest.resetModules();
    mockMistralInstance = {
      files: { upload: jest.fn() },
      ocr: { process: jest.fn() },
    };

    // Mock Mistral BEFORE requiring the module
    jest.doMock("@mistralai/mistralai", () => ({
      Mistral: jest.fn(() => mockMistralInstance),
    }));

    // Require the module after mocking
    parsePdf = require("../pdfLoader").parsePdf;
  });

  it("should successfully parse PDF using Mistral OCR", async () => {
    mockMistralInstance.files.upload.mockResolvedValue({ id: "file_id" });
    mockMistralInstance.ocr.process.mockResolvedValue({
      pages: [{ markdown: "page 1 content" }, { markdown: "page 2 content" }],
    });

    const buffer = Buffer.from("dummy pdf");
    const result = await parsePdf(buffer);

    expect(mockMistralInstance.files.upload).toHaveBeenCalled();
    expect(mockMistralInstance.ocr.process).toHaveBeenCalledWith(
      expect.objectContaining({
        document: { type: "file", fileId: "file_id" },
      })
    );
    expect(result.text).toBe("page 1 content\n\npage 2 content");
    expect(result.pages).toBe(2);
  });

  it("should handle OCR errors", async () => {
    mockMistralInstance.files.upload.mockRejectedValueOnce(
      new Error("Upload failed")
    );

    await expect(parsePdf(Buffer.from("dummy"))).rejects.toThrow(
      "Upload failed"
    );
  });
});
