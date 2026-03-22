import mongoose, { Document } from "mongoose";

export interface SystemParameters extends Document {
  recordingsCount: number;
  totalRecordingsDuration: number;
  motionEventsCount: number;
  status: "Active" | "Inactive";
  resolution: string;
  lastUpdated: Date;
}

const SystemParametersSchema = new mongoose.Schema<SystemParameters>({
  recordingsCount: { type: Number, default: 0 },
  totalRecordingsDuration: { type: Number, default: 0 },
  motionEventsCount: { type: Number, default: 0 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Inactive" },
  resolution: { type: String, default: "1280x720" },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model<SystemParameters>("SystemParameters", SystemParametersSchema);
