import { Schema, model, type Model, type Document } from "mongoose";

export interface IMessage extends Document {
  text: string;
  sender: Schema.Types.ObjectId;
  room: string;
  isRead: boolean;
}

export interface IRoom extends Document {
  room: string;
  user: Schema.Types.ObjectId;
  lastMessage?: Schema.Types.ObjectId;
}

const roomSchema = new Schema<IRoom>({
  room: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  lastMessage: { type: Schema.Types.ObjectId, ref: "message" },
});

export const Room: Model<IRoom> = model<IRoom>("room", roomSchema);

const messageSchema = new Schema<IMessage>(
  {
    text: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
    room: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Message: Model<IMessage> = model<IMessage>(
  "message",
  messageSchema,
);
