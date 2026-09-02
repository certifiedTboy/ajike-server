import { Router, } from "express";
import { newJwt } from "./jwt.js";
import { HttpException } from "./exceptions/http-exception.js";
import { validationResult } from "express-validator";
import multer from "multer";
import {} from "./types.js";
/**
 * @class AppRoutesHandler
 * @description A base class that provides common middleware handlers for application routes.
 * This includes validation checking and various authentication guards.
 */
export class AppRoutesHandler {
    routes;
    constructor() {
        this.routes = Router();
    }
    /**
     * @method checkValidationResult
     * @description A middleware to check for validation errors from express-validator.
     * If errors are found, it passes a new HttpException to the next error-handling middleware.
     * @param {Request} req - The Express request object.
     * @param {Response} _res - The Express response object (unused).
     * @param {NextFunction} next - The next middleware function in the stack.
     */
    checkValidationResult(req, _res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(new HttpException(400, errors?.array()[0]?.msg || "validation error"));
        }
        next();
    }
    /**
     * @method authGuard
     * @description A middleware to protect routes by ensuring a user is authenticated.
     * It checks for a JWT in the 'authToken' cookie, verifies it, and attaches the payload to `req.user`.
     * @param {Request} req - The Express request object.
     * @param {Response} _res - The Express response object (unused).
     * @param {NextFunction} next - The next middleware function in the stack.
     */
    authGuard(req, _res, next) {
        try {
            const authToken = req.cookies["authToken"];
            if (!authToken) {
                throw new HttpException(403, "Unauthorized");
            }
            const payload = newJwt.verifyAccessToken(authToken);
            req.user = payload;
            next();
        }
        catch (error) {
            if (error instanceof HttpException) {
                next(new HttpException(403, "Unathorized"));
            }
            if (error instanceof Error) {
                if (error?.message === "invalid signature") {
                    next(new HttpException(401, "Unauthorized"));
                }
                if (error?.message === "jwt expired") {
                    next(new HttpException(401, "jwt expired"));
                }
            }
        }
    }
    /**
     * @method adminGuard
     * @description A middleware that acts as an authentication and authorization guard.
     * It ensures that a user is authenticated via a JWT in the 'authToken' cookie
     * and that the user has the 'admin' role.
     * @param {Request} req - The Express request object.
     * @param {Response} _res - The Express response object (unused).
     * @param {NextFunction} next - The next middleware function in the stack.
     */
    adminGuard(req, _res, next) {
        try {
            const authToken = req.cookies["authToken"];
            if (!authToken) {
                throw new HttpException(403, "Unauthorized");
            }
            const payload = newJwt.verifyAccessToken(authToken);
            if (payload.role !== "admin") {
                throw new HttpException(403, "Unauthorized");
            }
            req.user = payload;
            next();
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @method multerUpload
     */
    multerUpload() {
        const storage = multer.memoryStorage();
        const fileFilter = (_req, file, cb) => {
            if (file.mimetype.startsWith("image/")) {
                cb(null, true);
            }
            else {
                cb(new HttpException(400, "Only image files are allowed!"));
            }
        };
        return multer({
            storage,
            fileFilter,
            limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
        });
    }
}
