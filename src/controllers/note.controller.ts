import { Request, Response, NextFunction } from "express";
import Note from "../models/note.model";
import Folder from "../models/folder.model";

// Define a custom type for requests with a strongly typed body
interface TypedRequestBody<T> extends Request {
  body: T;
}

// Create Note within a specific Folder
export const createNote = async (
  req: TypedRequestBody<{ title: string; content: string }>, // Expecting title and content in the request body
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.params; // Extract folder ID from request parameters
    const { title, content } = req.body; // Extract title and content from request body

    // Validate that both title and content are provided
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Create and save the new note in the folder
    const note = new Note({ title, content, folder: folderId });
    await note.save();

    // Respond with the created note
    res.status(201).json(note);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
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
    const { folderId } = req.params; // Extract folder ID from request parameters

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Fetch all notes within the folder, sorted by most recent update
    const notes = await Note.find({ folder: folderId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
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
    const { folderId, noteId } = req.params; // Extract folder and note IDs from request parameters

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Find the note within the folder
    const note = await Note.findOne({ _id: noteId, folder: folderId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    // Respond with the found note
    res.json(note);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Update Note within a specific Folder
export const updateNote = async (
  req: TypedRequestBody<{ title?: string; content?: string }>, // Title and/or content are optional in the request body
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId, noteId } = req.params; // Extract folder and note IDs from request parameters
    const { title, content } = req.body; // Extract title and content from request body

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Find and update the note within the folder
    const note = await Note.findOneAndUpdate(
      { _id: noteId, folder: folderId },
      { title, content },
      { new: true } // Return the updated note
    );

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    // Respond with the updated note
    res.json(note);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
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
    const { folderId, noteId } = req.params; // Extract folder and note IDs from request parameters

    // Check if the folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Find the note within the folder
    const note = await Note.findOne({ _id: noteId, folder: folderId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    // Delete the note
    await Note.findByIdAndDelete(noteId);

    // Respond with a success message
    res.json({ message: "Note deleted successfully" });
  } catch (err: unknown) {
    // Handle errors and send appropriate response
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
