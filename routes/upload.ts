import { Request, Response, Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { parsePdf } from "../ingestion/pdfLoader";
import { ChunkOutput, chunkText } from "../ingestion/chunker";
import { generateEmbedding } from "../ingestion/embedder";
import { ChunkModel } from "../db/schema";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }
      const fileName = req.file.originalname;
      const pdfBuffer = req.file.buffer;
      const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

      const existingChunk = await ChunkModel.findOne({
        "metadata.pdfHash": pdfHash,
      }).limit(1);

      if (existingChunk) {
        return res.status(409).json({
          message: "File already exists in database",
          isDuplicate: true,
          documentId: existingChunk.documentId,
          filename: fileName,
        });
      }

      await ChunkModel.deleteMany({ "metadata.filename": fileName });

      // 1. Parsing text from the PDF
      const response = await parsePdf(pdfBuffer);

      // 2. Making chunks
      const inputMetadata = {
        documentId: `pdf_${Date.now()}`,
        filename: fileName,
        pdfHash,
        totalPages: response.pages,
      };

      const chunkOptions = { chunkSize: 700, overlap: 200 };
      const chunks: ChunkOutput[] = chunkText(
        response.text,
        inputMetadata,
        chunkOptions
      );

      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunk) => {
          const embedding = await generateEmbedding(chunk.content);
          return {
            documentId: chunk.documentId,
            content: chunk.content,
            embedding: embedding,
            chunkIndex: chunk.chunkIndex,
            metadata: chunk.metadata,
            checksum: chunk.checksum,
          };
        })
      );

      await ChunkModel.insertMany(chunksWithEmbeddings);

      return res.status(200).json({
        message: "PDF processed successfully",
        documentId: inputMetadata.documentId,
        filename: fileName,
        totalChunks: chunks.length,
        totalPages: response.pages,
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      return res.status(500).json({
        message: "Error processing PDF",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
