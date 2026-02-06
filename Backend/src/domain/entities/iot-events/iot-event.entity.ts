import mongoose, { Document } from "mongoose";

export interface IoTEvent extends Document {
  type: "motion" | "button";
  timestamp: Date;
}

const IoTEventSchema = new mongoose.Schema<IoTEvent>({
  type: { type: String, enum: ["motion", "button"], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IoTEvent>("IoTEvent", IoTEventSchema);
