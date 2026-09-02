import { Schema, model } from "mongoose";
const roomSchema = new Schema({
    room: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "message" },
});
export const Room = model("room", roomSchema);
const messageSchema = new Schema({
    text: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
    room: { type: String, required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
export const Message = model("message", messageSchema);
