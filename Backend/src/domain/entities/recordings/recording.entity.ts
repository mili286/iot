import mongoose, { Document } from "mongoose";

export interface Recording extends Document {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  duration: number;
  timestamp: Date;
  recordingDate: Date;
  syncDate: Date;
  triggerType: string;
  userId?: string;
}

const RecordingSchema = new mongoose.Schema<Recording>({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  duration: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  recordingDate: { type: Date, default: Date.now },
  syncDate: { type: Date, default: Date.now },
  triggerType: { type: String, default: "unknown" },
  userId: { type: String, required: false },
});

export default mongoose.model<Recording>("Recording", RecordingSchema);
