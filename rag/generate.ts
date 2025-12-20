import axios from "axios";
import { Response } from "express";
import { prompt as PROMPT_TEMPLATE } from "./prompt";

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL_URL = "https://router.huggingface.co/v1/chat/completions";

export const chatCompletions = async (
  contextChunks: string[],
  query: string,
  res: Response
): Promise<void> => {
  try {
    const context = contextChunks.join("\n\n---\n\n");

    // 1. Prepare the raw data block using the template
    const userContent = PROMPT_TEMPLATE.replace("{context}", context).replace(
      "{query}",
      query
    );

    // 2. Define the strict behavior in the SYSTEM role
    const systemInstructions = `You are a "Strict Document Retrieval Agent." 
    Your sole purpose is to answer queries using ONLY the provided [DOCUMENT CONTEXT].
    
    RULES:
    - If the answer is not in the context, say: "I'm sorry, but the provided document does not contain enough information."
    - Do NOT use external knowledge.
    - Provide a concise summary first, then bullet points if needed.
    - Do not repeat headers or instructions in your output.
    - Use clean Markdown formatting.`;

    const response = await axios.post(
      MODEL_URL,
      {
        model: "meta-llama/Llama-3.2-3B-Instruct",
        messages: [
          {
            role: "system",
            content: systemInstructions,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        max_tokens: 1024,
        temperature: 0.1, // Low temperature ensures factual, non-repetitive answers
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    // Pipe the LLM stream directly to the Express response
    response.data.pipe(res);

    // Handle stream termination
    response.data.on("end", () => res.end());
  } catch (error: any) {
    console.error("LLM Generation Error:", error.message);

    if (error.response && error.response.data) {
      error.response.data.on("data", (chunk: Buffer) => {
        console.error("HF API Error Detail:", chunk.toString());
      });
    }

    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate response from LLM" });
    }
  }
};
