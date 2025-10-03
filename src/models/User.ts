import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "@/types/User";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const UserModel =
  (models?.User as mongoose.Model<IUser>) || model<IUser>("User", userSchema);

export default UserModel;
