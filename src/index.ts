import express from "express"; // Express framework for building the API
import mongoose from "mongoose"; // MongoDB ODM for connecting to the database
import dotenv from "dotenv"; // Environment variable management
import folderRouter from "./routes/folder.routes"; // Import folder routes
import noteRouter from "./routes/note.routes"; // Import note routes
import path from "path"; // Path module for working with file and directory paths

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create an instance of the Express application
const PORT = process.env.PORT || 3000; // Set port to environment variable or fallback to 3000

// Middleware for parsing JSON in incoming requests
app.use(express.json());

// Set up API routes
app.use("/folders", folderRouter); // All routes starting with /folders will be handled by folderRouter
app.use("/notes", noteRouter); // All routes starting with /notes will be handled by noteRouter

// Serve static files (frontend assets) from the /dist/frontend directory
app.use(express.static(path.join(__dirname, "../dist/frontend")));

// Specific route for serving the dashboard HTML page
// This will serve the dashboard.html file located in the /dist/frontend directory
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/frontend", "dashboard.html"));
});

// Catch-all route for serving index.html for any unmatched routes
// This serves the main app HTML page (usually the entry point for a frontend SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/frontend", "index.html"));
});

// MongoDB connection setup
const MONGO_URI = process.env.MONGO_URI; // Retrieve MongoDB URI from environment variables
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables"); // Error if MongoDB URI is missing
}

// Establish connection to MongoDB and start the server
mongoose
  .connect(MONGO_URI) // Connect to MongoDB using the URI from environment variables
  .then(() => {
    console.log("Connected to MongoDB"); // Log success message once connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`); // Start the server on the specified port
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err)); // Log any errors during the connection
