import { MessageControllers } from "./message-controller.tsx";
import { AppRoutesHandler } from "../lib/app-routes-middlewares.ts";

/**
 * @class MessageRoutes
 * @extends AppRoutesHandler
 * @description A class to handle message-related routes for the application.
 */
export class MessageRoutes extends AppRoutesHandler {
  constructor() {
    super();
    this.featureRoutes();
  }

  /**
   * @private featureRoutes
   * @description Sets up the specific routes for user features, including their validation and authentication middleware.
   */
  private featureRoutes() {
    this.routes.post(
      "/user",
      this.authGuard,

      MessageControllers.getAllMessagesByUser,
    );

    this.routes.get("/rooms", this.adminGuard, MessageControllers.getAllRooms);

    this.routes.get(
      "/rooms/:room/messages",
      this.adminGuard,
      MessageControllers.getAllMessagesByRoom,
    );
  }
}
