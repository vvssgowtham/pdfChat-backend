import app from "./app";
import connectDB from "./db/dbConnection";
import upload from "./routes/upload";
import chat from "./routes/chat";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Connect to database BEFORE starting the server
    await connectDB();
    console.log("✅ Database connected successfully");

    // Register routes AFTER database connection
    app.use("/", upload);
    app.use("/", chat);

    // Start listening only after DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
