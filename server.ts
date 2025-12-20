import app from "./app";
import connectDB from "./db/dbConnection";
import upload from "./routes/upload";
import chat from "./routes/chat";

const PORT = process.env.PORT || 8000;

app.use("/", upload);
app.use("/", chat);

const onServerStart = async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
};

app.listen(PORT, onServerStart);
