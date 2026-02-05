import mongoose, { Document, Schema } from "mongoose";

export interface RefreshToken extends Document {
  userId: string;
  refreshToken: string;
}

const RefreshTokenSchema = new Schema({
  userId: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

export default mongoose.model<RefreshToken>("RefreshToken", RefreshTokenSchema);
