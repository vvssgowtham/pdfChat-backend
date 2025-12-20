import { Request, Response, Router } from "express";
import { retrieveRelevantChunks } from "../rag/similarity";
import { chatCompletions } from "../rag/generate";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { query, documentId } = req.body;

    if (!query || !documentId) {
      return res
        .status(400)
        .json({ message: "Query and documentId are required" });
    }

    const chunks = await retrieveRelevantChunks(query, documentId);

    const contextContent = chunks.map((chunk) => chunk.content);

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await chatCompletions(contextContent, query, res);
  } catch (error) {
    console.error("Error in chat route:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.end();
  }
});

export default router;
