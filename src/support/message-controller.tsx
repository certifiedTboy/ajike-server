import type { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../lib/response-handler.ts";
import { MessageServices } from "./message-services.ts";

export class MessageControllers {
  /**
   * @static getAllMessagesByUser
   * @description Handles get all messages by user .
   */
  public static async getAllMessagesByUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = 20;

      const result = await MessageServices.getMessagesByUser(
        limit,
        page,
        req?.user?.id!,
      );
      ResponseHandler.created(res, 201, "success", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static getAllRooms
   * @description Handles fetching all rooms with pagination.
   */
  public static async getAllRooms(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = 20;
      const result = await MessageServices.getAllRooms(limit, page);
      ResponseHandler.ok(res, 200, "services fetched successfully", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static getAllMessagesByRoom
   * @description Handles fetching all messages that belongs to a room with pagination.
   */
  public static async getAllMessagesByRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const room = req?.params?.room;
      const page = parseInt(req.query.page as string);
      const limit = 20;
      const result = await MessageServices.getMessagesByRoom(
        limit,
        page,
        room as string,
      );
      ResponseHandler.ok(res, 200, "services fetched successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
