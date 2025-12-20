import { generateEmbedding } from "../ingestion/embedder";
import { ChunkModel } from "../db/schema";

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be of the same length");
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
};

export const retrieveRelevantChunks = async (
  query: string,
  documentId: string,
  k: number = 5
) => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const chunks = await ChunkModel.find({ documentId }).lean();

    if (!chunks || chunks.length === 0) {
      console.warn(`No chunks found for documentId: ${documentId}`);
      return [];
    }

    const scoredChunks = chunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding as number[]),
    }));

    // Sort by similarity score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return top k chunks
    return scoredChunks.slice(0, k).map((item) => ({
      content: item.chunk.content,
      score: item.score,
      metadata: item.chunk.metadata,
    }));
  } catch (error) {
    console.error("Error retrieving relevant chunks:", error);
    throw error;
  }
};
