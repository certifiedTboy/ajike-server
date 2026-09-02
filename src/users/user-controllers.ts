import type { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../lib/response-handler.ts";
import { UserServices } from "./user-services.ts";
import { HttpException } from "../lib/exceptions/http-exception.ts";

/**
 * @class UserControllers
 * @description A class that contains static methods for handling user-related HTTP requests.
 * It serves as the controller layer for user management, processing requests for user creation,
 * verification, and profile retrieval.
 */
export class UserControllers {
  constructor() {}

  /**
   * @static
   * @async
   * @method createNewUser
   * @description Handles the creation of a new user account. It extracts user data from the
   * request body, calls the user service to create the user, and sends a success response.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async createNewUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { firstName, lastName, email, password, phoneNumber } = req.body;

      const result = await UserServices.createUser({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });

      ResponseHandler.created(res, 201, "user created successfully", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method verifyUserAccount
   * @description Handles user account verification using an OTP. It extracts the OTP from the
   * request body, calls the service to verify the user, and returns a success response.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async verifyUserAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { otp } = req.body;

      const result = await UserServices.verifyUser(otp);

      ResponseHandler.ok(res, 200, "user verified successfully", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method requestPasswordReset
   * @description handles password reset request by user
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;

      const result = await UserServices.passwordResetRequest(email);

      ResponseHandler.created(
        res,
        201,
        "Password reset request successful",
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method updatePassword
   * @description handles password update request by user
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { otp, password } = req.body;

      const result = await UserServices.updatePassword(otp, password);

      ResponseHandler.created(
        res,
        201,
        "Password reset request successful",
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method getCurrentUserProfile
   * @description Handles the request to fetch the profile of the currently authenticated user.
   * It retrieves the user's email from the request object (attached by auth middleware) and fetches the profile.
   * @param {Request} req - The Express request object, expected to have a `user` property.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async getCurrentUserProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const email = req?.user?.email;

      const result = await UserServices.checkIfUserExist({
        email,
      });

      const user = {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        role: result.role || "user",
        picture: result.picture || "",
      };

      ResponseHandler.ok(res, 200, "user profile fetched successfully", user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method getAllUsers
   * @description Handles fetching all users for an admin.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (req?.query?.page) {
        const page = parseInt(req.query.page as string);
        const limit = 1;
        const result = await UserServices.getAllUsers(limit, page);
        ResponseHandler.ok(res, 200, "Users fetched successfully", result);
      } else {
        const page = 1;
        const limit = parseInt(req.query.limit as string) || 30;
        const result = await UserServices.getAllUsers(limit, page);
        ResponseHandler.ok(res, 200, "Users fetched successfully", result);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method addNewEmailToNewLetters
   * @description Handles adding a new email to new letters
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async addNewEmailToNewLetters(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;

      const result = await UserServices.addEmailToNewLetters(email);

      ResponseHandler.created(res, 201, "email added successfully", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method removeEmailFromNewsLetter
   * @description Handles removing an email from new letter.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async removeEmailFromNewsLetter(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;

      await UserServices.removeEmailFromNewLetter(email);

      ResponseHandler.ok(res, 200, "email removed successfully", null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @async
   * @method getAllNewsLetterEmails
   * @description Handles fetching all emails in news letters.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */
  public static async getAllNewsLetterEmails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { emails, total } = await UserServices.getAllEmails(limit, page);
      ResponseHandler.ok(res, 200, "Users fetched successfully", {
        emails,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method deleteUserAccount
   * @description handles user account deletion
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   */

  public static async deleteUserAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const email = req?.user?.email;

      if (!email) throw new HttpException(400, "invalid request");

      await UserServices.deleteAccount(email);

      ResponseHandler.ok(res, 200, "user account deleted successfully", null);
    } catch (error) {
      next(error);
    }
  }
}
