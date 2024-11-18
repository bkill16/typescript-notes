import express from "express";
import {
  createNote,
  getNotesInFolder,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller";

const router = express.Router();

router.post("/:folderId", createNote);
router.get("/:folderId", getNotesInFolder);
router.get("/:folderId/:noteId", getNote);
router.put("/:folderId/:noteId", updateNote);
router.delete("/:folderId/:noteId", deleteNote);

export default router;
