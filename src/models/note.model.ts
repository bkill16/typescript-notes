import mongoose, { Schema, Document } from "mongoose";

interface INote extends Document {
  title: string;
  content: string;
  folder: mongoose.Types.ObjectId;
}

const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  folder: { type: Schema.Types.ObjectId, ref: "Folder", required: true },
});

export default mongoose.model<INote>("Note", NoteSchema);
