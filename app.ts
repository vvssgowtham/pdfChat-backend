import express, { type Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: [
      "https://pdf-chat-frontend-inky.vercel.app",
      "https://pdfchat.vvssgowtham.dev",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

export default app;
