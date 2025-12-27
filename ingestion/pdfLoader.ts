import { Mistral } from "@mistralai/mistralai";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY!;
const client = new Mistral({ apiKey: MISTRAL_API_KEY });

interface PdfParseResponse {
  text: string;
  pages: number;
}

export const parsePdf = async (buffer: Buffer): Promise<PdfParseResponse> => {
  try {
    // Convert Buffer -> Uint8Array -> Blob (fixes TS + runtime)
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/pdf",
    });

    const upload = await client.files.upload({
      purpose: "ocr",
      file: blob,
    });

    const ocr = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "file",
        fileId: upload.id,
      },
      tableFormat: "markdown",
    });

    const pages = ocr.pages ?? [];
    const text = pages
      .map((p) => p.markdown ?? "")
      .join("\n\n")
      .trim();

    return {
      text,
      pages: pages.length,
    };
  } catch (error: unknown) {
    console.error(
      "Mistral OCR error:",
      typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: unknown } }).response?.data
        : error
    );

    const message = error instanceof Error ? error.message : "OCR failed";

    throw new Error(message);
  }
};
