import request from "supertest";
import express from "express";
import uploadRouter from "../upload";
import { parsePdf } from "../../ingestion/pdfLoader";
import { chunkText } from "../../ingestion/chunker";
import { generateEmbedding } from "../../ingestion/embedder";
import { ChunkModel } from "../../db/schema";

jest.mock("../../ingestion/pdfLoader");
jest.mock("../../ingestion/chunker");
jest.mock("../../ingestion/embedder");
jest.mock("../../db/schema");

const app = express();
app.use(express.json());
app.use("/", uploadRouter);

describe("POST /upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app).post("/upload");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("PDF file is required");
  });

  it("should process PDF successfully", async () => {
    (ChunkModel.findOne as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue(null),
    });
    (parsePdf as jest.Mock).mockResolvedValue({ text: "pdf text", pages: 1 });
    (chunkText as jest.Mock).mockReturnValue([
      {
        content: "chunk1",
        documentId: "doc1",
        chunkIndex: 0,
        metadata: {},
        checksum: "abc",
      },
    ]);
    (generateEmbedding as jest.Mock).mockResolvedValue([0.1, 0.2]);
    (ChunkModel.insertMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("%PDF-1.4..."), "test.pdf");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("PDF processed successfully");
    expect(res.body.documentId).toBeDefined();
    expect(ChunkModel.insertMany).toHaveBeenCalled();
  });

  it("should return 409 if file already exists", async () => {
    (ChunkModel.findOne as jest.Mock).mockReturnValue({
      limit: jest.fn().mockResolvedValue({ documentId: "existing_doc" }),
    });

    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("%PDF-1.4..."), "test.pdf");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("File already exists in database");
    expect(res.body.isDuplicate).toBe(true);
  });
});
