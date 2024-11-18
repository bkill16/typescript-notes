import express from "express";
import {
  createFolder, // Controller function to create a new folder
  getAllFolders, // Controller function to retrieve all folders
  getFolderWithNotes, // Controller function to retrieve a folder along with its notes
  updateFolder, // Controller function to update a folder's details
  deleteFolder, // Controller function to delete a folder and its notes
} from "../controllers/folder.controller";

const router = express.Router(); // Create a new Express router instance

// Route to create a new folder
// HTTP POST /
// Expects folder name in the request body
router.post("/", createFolder);

// Route to get all folders
// HTTP GET /
router.get("/", getAllFolders);

// Route to get a single folder and its associated notes
// HTTP GET /:folderId
// Expects folderId as a route parameter
router.get("/:folderId", getFolderWithNotes);

// Route to update a folder's details
// HTTP PUT /:folderId
// Expects folderId as a route parameter and updated folder details in the request body
router.put("/:folderId", updateFolder);

// Route to delete a folder and its associated notes
// HTTP DELETE /:folderId
// Expects folderId as a route parameter
router.delete("/:folderId", deleteFolder);

export default router; // Export the router to be used in the main application
