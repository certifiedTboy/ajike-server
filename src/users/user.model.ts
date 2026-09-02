import { Schema, model, type Model } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified?: boolean;
  role?: "admin" | "user";
  phoneNumber: string;
  picture?: string;
  password?: string;
  serviceCount?: number;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    serviceCount: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "user",
    },

    phoneNumber: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true },
);

const User: Model<IUser> = model<IUser>("user", userSchema);

export default User;

export interface INewsLetters extends Document {
  email: string;
}

const newLetterSchema = new Schema<INewsLetters>({
  email: { type: String, required: true, unique: true },
});

export const NewsLetter: Model<INewsLetters> = model<INewsLetters>(
  "newsletter",
  newLetterSchema,
);
