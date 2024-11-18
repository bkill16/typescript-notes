import express from "express";
import {
  createFolder,
  getAllFolders,
  getFolderWithNotes,
  updateFolder,
  deleteFolder,
} from "../controllers/folder.controller";

const router = express.Router();

router.post("/", createFolder);
router.get("/", getAllFolders);
router.get("/:folderId", getFolderWithNotes);
router.put("/:folderId", updateFolder);
router.delete("/:folderId", deleteFolder);

export default router;
