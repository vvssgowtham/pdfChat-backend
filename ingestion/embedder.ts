import axios from "axios";

const HF_API_KEY = process.env.HF_API_KEY!;
const MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await axios.post(
    MODEL_URL,
    {
      inputs: text,
      options: { wait_for_model: true },
    },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30_000,
    }
  );

  return response.data;
};
