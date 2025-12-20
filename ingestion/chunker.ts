import crypto from "crypto";

export interface ChunkInputMetadata {
  documentId: string;
  filename: string;
  totalPages: number;
}

export interface ChunkOutput {
  documentId: string;
  content: string;
  chunkIndex: number;
  checksum: string;
  metadata: {
    source: "pdf";
    filename: string;
    totalPages: number;
  };
}

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export const chunkText = (
  rawText: string,
  inputMetadata: ChunkInputMetadata,
  options: ChunkOptions
): ChunkOutput[] => {
  const chunkSize = options.chunkSize ?? 700;
  const overlap = options.overlap ?? 200;

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const stepSize = chunkSize - overlap;
  // 1. normalizing text
  const normalizedText = normalizeText(rawText);

  const chunks: ChunkOutput[] = [];

  let chunkIndex: number = 0;
  let index: number = 0;

  while (index < normalizedText.length) {
    const content = normalizedText.slice(index, index + chunkSize).trim();
    if (content.length === 0) {
      index += stepSize;
      continue;
    }

    const checkSum = crypto.createHash("sha256").update(content).digest("hex");
    chunks.push({
      documentId: inputMetadata.documentId,
      content,
      chunkIndex,
      checksum: checkSum,
      metadata: {
        source: "pdf",
        filename: inputMetadata.filename,
        totalPages: inputMetadata.totalPages,
      },
    });

    index += stepSize;
    chunkIndex++;
  }
  return chunks;
};

export const normalizeText = (rawText: string) => {
  return rawText
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
};
