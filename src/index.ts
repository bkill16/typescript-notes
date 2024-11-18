import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import folderRouter from "./routes/folder.routes";
import noteRouter from "./routes/note.routes";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());

// API routes first
app.use("/folders", folderRouter);
app.use("/notes", noteRouter);

// Then static files
app.use(express.static(path.join(__dirname, "../dist/frontend")));

// Specific route for dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/frontend", "dashboard.html"));
});

// Catch-all route last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/frontend", "index.html"));
});

// Database connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
