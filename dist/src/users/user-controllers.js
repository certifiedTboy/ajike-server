import { ResponseHandler } from "../lib/response-handler.js";
import { UserServices } from "./user-services.js";
import { HttpException } from "../lib/exceptions/http-exception.js";
/**
 * @class UserControllers
 * @description A class that contains static methods for handling user-related HTTP requests.
 * It serves as the controller layer for user management, processing requests for user creation,
 * verification, and profile retrieval.
 */
export class UserControllers {
    constructor() { }
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
    static async createNewUser(req, res, next) {
        try {
            const { firstName, lastName, email, password, phoneNumber } = req.body;
            const newFirstName = firstName?.charAt(0)?.toUpperCase() + firstName?.slice(1);
            const newLastName = lastName?.charAt(0)?.toUpperCase() + lastName?.slice(1);
            const result = await UserServices.createUser({
                firstName: newFirstName,
                lastName: newLastName,
                email,
                password,
                phoneNumber,
            });
            ResponseHandler.created(res, 201, "user created successfully", result);
        }
        catch (error) {
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
    static async verifyUserAccount(req, res, next) {
        try {
            const { otp } = req.body;
            const result = await UserServices.verifyUser(otp);
            ResponseHandler.ok(res, 200, "user verified successfully", result);
        }
        catch (error) {
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
    static async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            const result = await UserServices.passwordResetRequest(email);
            ResponseHandler.created(res, 201, "Password reset request successful", result);
        }
        catch (error) {
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
    static async updatePassword(req, res, next) {
        try {
            const { otp, password } = req.body;
            const result = await UserServices.updatePassword(otp, password);
            ResponseHandler.created(res, 201, "Password reset request successful", result);
        }
        catch (error) {
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
    static async getCurrentUserProfile(req, res, next) {
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
                phoneNumber: result?.phoneNumber || "",
            };
            ResponseHandler.ok(res, 200, "user profile fetched successfully", user);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static
     * @async
     * @method updateUser
     * @description updates user profile
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    static async udpateUser(req, res, next) {
        try {
            const userId = req?.params?.id;
            const result = await UserServices.updateUserData({ _id: userId }, { $set: { ...req.body } });
            ResponseHandler.ok(res, 200, "profile updated", result);
        }
        catch (error) {
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
    static async getAllUsers(req, res, next) {
        try {
            if (req?.query?.page) {
                const page = parseInt(req.query.page);
                const limit = 20;
                const result = await UserServices.getAllUsers(limit, page);
                ResponseHandler.ok(res, 200, "Users fetched successfully", result);
            }
            else {
                const page = 1;
                const limit = 20;
                const result = await UserServices.getAllUsers(limit, page);
                ResponseHandler.ok(res, 200, "Users fetched successfully", result);
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static
     * @async
     * @method updateUserProfile
     * @description updates user profile
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     */
    static async udpateUserProfile(req, res, next) {
        try {
            const userId = req?.user?.id;
            const result = await UserServices.updateUserData({ _id: userId }, { $set: { ...req.body } });
            ResponseHandler.ok(res, 200, "profile updated", result);
        }
        catch (error) {
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
    static async addNewEmailToNewLetters(req, res, next) {
        try {
            const { email } = req.body;
            const result = await UserServices.addEmailToNewLetters(email);
            ResponseHandler.created(res, 201, "email added successfully", result);
        }
        catch (error) {
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
    static async removeEmailFromNewsLetter(req, res, next) {
        try {
            const { email } = req.body;
            await UserServices.removeEmailFromNewLetter(email);
            ResponseHandler.ok(res, 200, "email removed successfully", null);
        }
        catch (error) {
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
    static async getAllNewsLetterEmails(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { emails, total } = await UserServices.getAllEmails(limit, page);
            ResponseHandler.ok(res, 200, "Users fetched successfully", {
                emails,
                total,
                page,
                limit,
            });
        }
        catch (error) {
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
    static async deleteUserAccount(req, res, next) {
        try {
            const email = req?.user?.email;
            if (!email)
                throw new HttpException(400, "invalid request");
            await UserServices.deleteAccount(email);
            ResponseHandler.ok(res, 200, "user account deleted successfully", null);
        }
        catch (error) {
            next(error);
        }
    }
}
