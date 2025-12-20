# PDF Chat Backend

A robust Node.js/Express backend service that enables intelligent conversations with PDF documents using RAG (Retrieval-Augmented Generation) architecture with Hugging Face AI models.

## 🚀 Features

- **PDF Processing**: Upload and parse PDF documents with automatic text extraction
- **Smart Chunking**: Intelligent text chunking with configurable size and overlap
- **Vector Embeddings**: Generate embeddings using Hugging Face's embedding models
- **Semantic Search**: Find relevant document chunks using cosine similarity
- **Streaming Chat**: Real-time streaming responses using Server-Sent Events (SSE)
- **MongoDB Storage**: Efficient storage and retrieval of document chunks and embeddings
- **Duplicate Detection**: Automatic detection of previously uploaded files

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Hugging Face API token

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: Hugging Face Inference API
- **PDF Processing**: pdf-parse
- **File Upload**: Multer

## 📦 Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the backend directory:

   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/pdfchat
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdfchat

   # Hugging Face API
   HF_TOKEN=your_huggingface_api_token_here

   # Server Configuration
   PORT=3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` with auto-reload on file changes.

### Production Mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### 1. Upload PDF

**Endpoint**: `POST /upload`

**Description**: Upload and process a PDF document

**Request**:

- Content-Type: `multipart/form-data`
- Body:
  - `file`: PDF file (max 10MB)

**Response** (200 OK):

```json
{
  "message": "PDF processed successfully",
  "documentId": "pdf_1703001234567",
  "filename": "document.pdf",
  "totalChunks": 24,
  "totalPages": 10
}
```

**Response** (409 Conflict - Duplicate):

```json
{
  "message": "File already exists in database",
  "isDuplicate": true,
  "documentId": "pdf_1703001234567",
  "filename": "document.pdf"
}
```

**Error Response** (400/500):

```json
{
  "message": "Error message",
  "error": "Detailed error description"
}
```

### 2. Chat with Document

**Endpoint**: `POST /chat`

**Description**: Ask questions about an uploaded document with streaming responses

**Request**:

- Content-Type: `application/json`
- Body:

```json
{
  "query": "What is this document about?",
  "documentId": "pdf_1703001234567"
}
```

**Response**:

- Content-Type: `text/event-stream`
- Streaming SSE format:

```
data: {"choices":[{"delta":{"content":"This"}}]}
data: {"choices":[{"delta":{"content":" document"}}]}
data: {"choices":[{"delta":{"content":" discusses..."}}]}
data: [DONE]
```

**Error Response** (400/404/500):

```json
{
  "message": "Error message",
  "error": "Detailed error description"
}
```

## 🏗️ Project Structure

```
backend/
├── app.ts                 # Express app configuration
├── server.ts             # Server entry point
├── db/
│   ├── dbConnection.ts   # MongoDB connection setup
│   └── schema.ts         # Mongoose schemas and models
├── routes/
│   ├── upload.ts         # PDF upload endpoint
│   └── chat.ts           # Chat endpoint
├── ingestion/
│   ├── pdfLoader.ts      # PDF parsing logic
│   ├── chunker.ts        # Text chunking algorithm
│   └── embedder.ts       # Embedding generation
├── rag/
│   ├── similarity.ts     # Cosine similarity search
│   ├── prompt.ts         # RAG prompt templates
│   └── generate.ts       # LLM response generation
└── package.json
```

## 🔧 Configuration

### Chunk Settings

Modify in `routes/upload.ts`:

```typescript
const chunkOptions = {
  chunkSize: 700, // Characters per chunk
  overlap: 200, // Overlap between chunks
};
```

### File Upload Limits

Modify in `routes/upload.ts`:

```typescript
limits: {
  fileSize: 10 * 1024 * 1024,  // 10MB max
}
```

### Top-K Results

Modify in `rag/similarity.ts`:

```typescript
const topK = 5; // Number of relevant chunks to retrieve
```

## 🔐 Environment Variables

| Variable      | Description               | Required | Default |
| ------------- | ------------------------- | -------- | ------- |
| `MONGODB_URI` | MongoDB connection string | Yes      | -       |
| `HF_TOKEN`    | Hugging Face API token    | Yes      | -       |
| `PORT`        | Server port               | No       | 3000    |

## 🚢 Deployment

### Railway

1. **Prepare for deployment**

   - Ensure `.env` is in `.gitignore`
   - Set environment variables in Railway dashboard

2. **Deploy**
   ```bash
   # Railway will automatically detect and use the start script
   npm run build
   npm start
   ```

### Heroku

1. **Create Procfile**

   ```
   web: npm start
   ```

2. **Deploy**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Docker

1. **Create Dockerfile**

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t pdfchat-backend .
   docker run -p 3000:3000 --env-file .env pdfchat-backend
   ```

## 🧪 Testing

Test the API using curl:

```bash
# Upload a PDF
curl -X POST http://localhost:3000/upload \
  -F "file=@document.pdf"

# Chat with document
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is this document about?",
    "documentId": "pdf_1703001234567"
  }'
```

## 📝 How It Works

1. **Upload Phase**:

   - PDF is uploaded and parsed to extract text
   - Text is split into overlapping chunks
   - Each chunk gets an embedding via Hugging Face
   - Chunks and embeddings are stored in MongoDB with document metadata

2. **Query Phase**:

   - User query is converted to an embedding
   - Cosine similarity finds the most relevant chunks
   - Top-K chunks are used as context
   - LLM generates a streaming response based on context

3. **RAG Architecture**:
   ```
   User Query → Embedding → Similarity Search → Context Retrieval
   → Prompt Construction → LLM Generation → Streaming Response
   ```

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
sudo systemctl status mongodb

# Or start MongoDB
sudo systemctl start mongodb
```

### Hugging Face API Errors

- Verify your `HF_TOKEN` is valid
- Check API rate limits
- Ensure the model endpoints are accessible

### File Upload Errors

- Verify file is a valid PDF
- Check file size is under 10MB
- Ensure sufficient disk space

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 🔗 Related

- Frontend: `../frontend/README.md`
- Hugging Face Documentation: https://huggingface.co/docs
- MongoDB Documentation: https://docs.mongodb.com
