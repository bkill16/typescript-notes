import { Request, Response, NextFunction } from "express";
import Folder from "../models/folder.model";
import Note from "../models/note.model";

interface TypedRequestBody<T> extends Request {
  body: T;
}

// Create Folder
export const createFolder = async (
  req: TypedRequestBody<{ name: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: "Folder name is required" });
      return;
    }

    const folder = new Folder({ name });
    await folder.save();

    res.status(201).json(folder);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get All Folders
export const getAllFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const folders = await Folder.find().sort({ name: 1 });
    res.json(folders);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get Single Folder with Notes
export const getFolderWithNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const notes = await Note.find({ folder: folderId }).sort({ updatedAt: -1 });

    res.json({
      folder,
      notes,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Update Folder
export const updateFolder = async (
  req: TypedRequestBody<{ name: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: "Folder name is required" });
      return;
    }

    const folder = await Folder.findByIdAndUpdate(
      folderId,
      { name },
      { new: true }
    );

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json(folder);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Delete Folder (and its notes)
export const deleteFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    await Note.deleteMany({ folder: folderId });
    await Folder.findByIdAndDelete(folderId);

    res.json({ message: "Folder and its notes deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
