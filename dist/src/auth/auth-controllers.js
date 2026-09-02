import { ResponseHandler } from "../lib/response-handler.js";
import { AuthServices } from "./auth-services.js";
/**
 * @class AuthControllers
 * @description A class that contains static methods for handling authentication-related HTTP requests.
 * It acts as the controller layer for authentication, processing requests and sending responses.
 */
export class AuthControllers {
    constructor() { }
    /**
     * @static
     * @async
     * @method loginUserWithEmail
     * @description Handles the user login request. It extracts credentials from the request body,
     * calls the authentication service, and sends back an authentication response with tokens.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    static async loginUserWithEmail(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthServices.userLoginWithEmail({
                email,
                password,
            });
            ResponseHandler.auth(res, 201, "user created successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static
     * @async
     * @method loginUserWithGoogle
     * @description Handles the user login request with google.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    static async loginUserWithGoogle(req, res, next) {
        try {
            const { token } = req.body;
            const result = await AuthServices.googleLogin(token);
            ResponseHandler.auth(res, 201, "user created successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static
     * @async
     * @method requestPasswordReset
     * @description Handles a request to initiate a password reset. It takes an email from the
     * request body, calls the service to send a reset OTP, and returns a success message.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    static async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            const result = await AuthServices.passwordResetRequest(email);
            ResponseHandler.ok(res, 200, "email for password reset has been sent to your email", result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static
     * @async
     * @method updateUserPassword
     * @description Handles the request to update a user's password using an OTP. It extracts
     * the OTP and new password from the request, calls the service to perform the update,
     * and returns a success response.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    static async updateUserPassword(req, res, next) {
        try {
            const { otp, password } = req.body;
            const result = await AuthServices.updatePassword(otp, password);
            ResponseHandler.ok(res, 200, "password updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    static logoutUser(_req, res, next) {
        try {
            ResponseHandler.logout(res, 200, "user logged out successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
