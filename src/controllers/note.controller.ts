import { Request, Response, NextFunction } from "express";
import Note from "../models/note.model";
import Folder from "../models/folder.model";

interface TypedRequestBody<T> extends Request {
  body: T;
}

// Create Note within a specific Folder
export const createNote = async (
  req: TypedRequestBody<{ title: string; content: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const note = new Note({ title, content, folder: folderId });
    await note.save();

    res.status(201).json(note);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get All Notes within a specific Folder
export const getNotesInFolder = async (
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
    res.json(notes);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Get Single Note within a specific Folder
export const getNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId, noteId } = req.params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const note = await Note.findOne({ _id: noteId, folder: folderId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json(note);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Update Note within a specific Folder
export const updateNote = async (
  req: TypedRequestBody<{ title?: string; content?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId, noteId } = req.params;
    const { title, content } = req.body;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, folder: folderId },
      { title, content },
      { new: true }
    );

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json(note);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Delete Note within a specific Folder
export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId, noteId } = req.params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const note = await Note.findOne({ _id: noteId, folder: folderId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    await Note.findByIdAndDelete(noteId);

    res.json({ message: "Note deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
