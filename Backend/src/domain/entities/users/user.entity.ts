import mongoose from "mongoose";
import passportLocalMongoose, {
  PassportLocalMongooseDocument,
  PassportLocalMongooseModel,
} from "passport-local-mongoose";

export interface User extends PassportLocalMongooseDocument {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

const UserSchema = new mongoose.Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

// plugin limitation
UserSchema.plugin(passportLocalMongoose as any);

export default mongoose.model<User, PassportLocalMongooseModel<User>>(
  "User",
  UserSchema,
);
