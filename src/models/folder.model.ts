import mongoose, { Schema, Document } from "mongoose";

interface IFolder extends Document {
  name: string;
}

const FolderSchema: Schema = new Schema({
  name: { type: String, required: true },
});

export default mongoose.model<IFolder>("Folder", FolderSchema);
