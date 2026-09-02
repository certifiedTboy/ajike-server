import { Types } from "mongoose";
import { Message, Room, type IMessage, type IRoom } from "./message-model.tsx";

export class MessageServices {
  /**
   * @static createMessage
   * @description add a new message to database.
   * @param {IMessage} messageData - The data for the new message.
   * @returns {Promise<IMessage>} A promise that resolves to the new message.
   */
  public static async createMessage(
    messageData: Partial<IMessage>,
  ): Promise<IMessage> {
    const message = new Message(messageData);

    await message.save();

    await Room.findOneAndUpdate(
      // @ts-ignore
      { room: messageData.room },
      { lastMessage: message._id },
      { new: true },
    );

    return message;
  }

  /**
   * @static createRoom
   * @description creates a new room.
   * @param {IRoom} roomData - The data for the new room.
   * @returns {Promise<IRoom>} A promise that resolves to the new room.
   */
  public static async createRoom(roomData: Partial<IRoom>): Promise<IRoom> {
    const room = new Room(roomData);

    await room.save();

    return room;
  }

  /**
   * @static getMessagesByUser
   * @description Retrieves all messages by a user.
   * @param {number} limit - The number of message to return.
   * @param {number} page - The page number.
   * @param {string} userId - id of the user
   * @returns {Promise<{messages: IMessage[], total: number }>} A promise that resolves to the list of messages .
   */
  public static async getMessagesByUser(
    limit: number,
    page: number,
    userId: string,
  ) {
    const userObjectId = new Types.ObjectId(userId);

    const messages = await Message.find({ user: userObjectId })
      .populate("sender", "firstName lastName email phoneNumber role picture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalMessages = Message.countDocuments({ user: userObjectId });

    return { messages, total: totalMessages };
  }

  /**
   * @static getAllRooms
   * @description Retrieves all rooms.
   * @param {number} limit - The number of rooms to return.
   * @param {number} page - The page number.
   * @returns {Promise<{rooms: IRoom[], total: number }>} A promise that resolves to the list of rooms .
   */
  public static async getAllRooms(limit: number, page: number) {
    const rooms = await Room.find()
      .populate("user", "firstName lastName email phoneNumber role picture")
      .populate("lastMessage", "text sender room isRead createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalRooms = await Room.countDocuments();

    return { rooms, total: totalRooms };
  }

  /**
   * @static getMessagesByRoom
   * @description Retrieves all messages that belongs to a room.
   * @param {number} limit - The number of message to return.
   * @param {number} page - The page number.
   * @param {string} room
   * @returns {Promise<{messages: IMessage[], total: number }>} A promise that resolves to the list of messages .
   */
  public static async getMessagesByRoom(
    limit: number,
    page: number,
    room: string,
  ) {
    const messages = await Message.find({ room })
      .populate("sender", "firstName lastName email phoneNumber role picture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalMessages = await Message.countDocuments({ room });

    return { messages, total: totalMessages };
  }

  /**
   * @static checkIfRoomExist
   * @description checks if a room already exist
   * @param {string} room
   */
  public static async checkIfRoomExist(room: string) {
    const roomExist = await Room.findOne({ room }).populate(
      "user",
      "firstName lastName email phoneNumber role picture",
    );

    return roomExist;
  }
}
