import express from "express";
import {
  createNote, // Controller function to create a new note within a folder
  getNotesInFolder, // Controller function to retrieve all notes within a specific folder
  getNote, // Controller function to retrieve a specific note within a folder
  updateNote, // Controller function to update a note within a folder
  deleteNote, // Controller function to delete a specific note within a folder
} from "../controllers/note.controller";

const router = express.Router(); // Create a new Express router instance

// Route to create a new note within a specific folder
// HTTP POST /:folderId
// Expects folderId as a route parameter and note title/content in the request body
router.post("/:folderId", createNote);

// Route to get all notes within a specific folder
// HTTP GET /:folderId
// Expects folderId as a route parameter
router.get("/:folderId", getNotesInFolder);

// Route to get a single note within a specific folder
// HTTP GET /:folderId/:noteId
// Expects folderId and noteId as route parameters
router.get("/:folderId/:noteId", getNote);

// Route to update a note within a specific folder
// HTTP PUT /:folderId/:noteId
// Expects folderId and noteId as route parameters, and updated note title/content in the request body
router.put("/:folderId/:noteId", updateNote);

// Route to delete a specific note within a specific folder
// HTTP DELETE /:folderId/:noteId
// Expects folderId and noteId as route parameters
router.delete("/:folderId/:noteId", deleteNote);

export default router; // Export the router to be used in the main application
