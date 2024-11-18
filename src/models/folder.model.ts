import mongoose, { Schema, Document } from "mongoose";

// Define the interface for a Folder document
// Extends mongoose's Document interface to ensure proper typing for MongoDB documents
interface IFolder extends Document {
  name: string; // Name of the folder
}

// Define the schema for the Folder collection
const FolderSchema: Schema = new Schema({
  name: { type: String, required: true }, // Folder name is a required string field
});

// Export the Folder model
// Associates the schema with the "Folder" collection in the database
export default mongoose.model<IFolder>("Folder", FolderSchema);
