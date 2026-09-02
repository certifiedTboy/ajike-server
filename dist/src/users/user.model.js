import { Schema, model } from "mongoose";
const userSchema = new Schema({
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
}, { timestamps: true });
const User = model("user", userSchema);
export default User;
const newLetterSchema = new Schema({
    email: { type: String, required: true, unique: true },
});
export const NewsLetter = model("newsletter", newLetterSchema);
