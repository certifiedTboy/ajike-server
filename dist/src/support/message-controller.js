import { ResponseHandler } from "../lib/response-handler.js";
import { MessageServices } from "./message-services.js";
export class MessageControllers {
    /**
     * @static getAllMessagesByUser
     * @description Handles get all messages by user .
     */
    static async getAllMessagesByUser(req, res, next) {
        try {
            const page = parseInt(req.query.page);
            const limit = 20;
            const result = await MessageServices.getMessagesByUser(limit, page, req?.user?.id);
            ResponseHandler.created(res, 201, "success", result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static getAllRooms
     * @description Handles fetching all rooms with pagination.
     */
    static async getAllRooms(req, res, next) {
        try {
            const page = parseInt(req.query.page);
            const limit = 20;
            const result = await MessageServices.getAllRooms(limit, page);
            ResponseHandler.ok(res, 200, "services fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static getAllMessagesByRoom
     * @description Handles fetching all messages that belongs to a room with pagination.
     */
    static async getAllMessagesByRoom(req, res, next) {
        try {
            const room = req?.params?.room;
            const page = parseInt(req.query.page);
            const limit = 20;
            const result = await MessageServices.getMessagesByRoom(limit, page, room);
            ResponseHandler.ok(res, 200, "services fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
}
