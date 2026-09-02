import { HttpException } from "./http-exception.js";
export function globalExceptionHandler(err, req, res, _next) {
    let statusCode;
    let message;
    let error;
    if (err instanceof HttpException) {
        statusCode = err.statusCode || 500;
        message = err.message || "Internal Server Error";
    }
    else {
        statusCode = 500;
        message = "Internal Server Error";
        // In development, send the actual error message
        if (process.env.NODE_ENV !== "production") {
            error = err.stack;
        }
        // Log the error for debugging purposes
        req.app.locals.logger?.error(err);
    }
    res.status(statusCode).json({ success: false, statusCode, message, error });
}
