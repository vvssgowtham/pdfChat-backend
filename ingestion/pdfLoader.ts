import pdfParse = require("pdf-parse");

interface PdfParseResponse {
  text: string;
  pages: number;
}

export const parsePdf = async (
  buffer: Buffer
): Promise<PdfParseResponse> => {
  const data = await pdfParse(buffer);

  return {
    text: data.text,
    pages: data.numpages,
  };
};
