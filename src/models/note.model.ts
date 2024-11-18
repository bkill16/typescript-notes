import mongoose, { Schema, Document } from "mongoose";

// Define the interface for a Note document
// Extends mongoose's Document interface to ensure proper typing for MongoDB documents
interface INote extends Document {
  title: string; // Title of the note
  content: string; // Content of the note
  folder: mongoose.Types.ObjectId; // Reference to the associated folder's ID
}

// Define the schema for the Note collection
const NoteSchema: Schema = new Schema({
  title: { type: String, required: true }, // Note title is a required string field
  content: { type: String, required: true }, // Note content is a required string field
  folder: { type: Schema.Types.ObjectId, ref: "Folder", required: true },
  // The folder field is a reference to the Folder model (foreign key)
});

// Export the Note model
// Associates the schema with the "Note" collection in the database
export default mongoose.model<INote>("Note", NoteSchema);
