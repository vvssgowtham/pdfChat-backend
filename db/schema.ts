import { Schema, model } from "mongoose";

const ChunkSchema = new Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
      index: true,
    },

    metadata: {
      source: {
        type: String,
        enum: ["pdf"],
        default: "pdf",
      },

      filename: {
        type: String,
        required: true,
      },

      totalPages: {
        type: Number,
        required: true,
      },
    },

    checksum: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

ChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export const ChunkModel = model("Chunk", ChunkSchema);
