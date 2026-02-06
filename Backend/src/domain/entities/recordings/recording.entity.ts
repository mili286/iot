import mongoose, { Document } from "mongoose";

export interface Recording extends Document {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  timestamp: Date;
}

const RecordingSchema = new mongoose.Schema<Recording>({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<Recording>("Recording", RecordingSchema);
