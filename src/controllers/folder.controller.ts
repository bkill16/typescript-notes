import { Request, Response, NextFunction } from "express";
import Folder from "../models/folder.model";
import Note from "../models/note.model";

// Define a custom type for requests with a strongly typed body
interface TypedRequestBody<T> extends Request {
  body: T;
}

// Create Folder
export const createFolder = async (
  req: TypedRequestBody<{ name: string }>, // Expecting request body to contain a `name` field
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    // Validate that the folder name is provided
    if (!name) {
      res.status(400).json({ error: "Folder name is required" });
      return;
    }

    // Create and save a new folder
    const folder = new Folder({ name });
    await folder.save();

    // Respond with the created folder
    res.status(201).json(folder);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
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
    // Fetch all folders sorted alphabetically by name
    const folders = await Folder.find().sort({ name: 1 });
    res.json(folders);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
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

    // Find folder by ID
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Fetch all notes within the folder, sorted by most recent update
    const notes = await Note.find({ folder: folderId }).sort({ updatedAt: -1 });

    // Respond with folder and its notes
    res.json({
      folder,
      notes,
    });
  } catch (err: unknown) {
    // Handle errors and send appropriate response
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Update Folder
export const updateFolder = async (
  req: TypedRequestBody<{ name: string }>, // Expecting request body to contain a `name` field
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    // Validate that the new folder name is provided
    if (!name) {
      res.status(400).json({ error: "Folder name is required" });
      return;
    }

    // Update folder name and return the updated folder
    const folder = await Folder.findByIdAndUpdate(
      folderId,
      { name },
      { new: true } // Return the updated folder instead of the original
    );

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.json(folder);
  } catch (err: unknown) {
    // Handle errors and send appropriate response
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

    // Find folder by ID
    const folder = await Folder.findById(folderId);
    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    // Delete all notes associated with the folder
    await Note.deleteMany({ folder: folderId });

    // Delete the folder itself
    await Folder.findByIdAndDelete(folderId);

    res.json({ message: "Folder and its notes deleted successfully" });
  } catch (err: unknown) {
    // Handle errors and send appropriate response
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
