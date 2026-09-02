import type { Request, Response, NextFunction } from "express";
import { HttpException } from "./http-exception.ts";

export function globalExceptionHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode: number;
  let message: string;
  let error: string | undefined;

  if (err instanceof HttpException) {
    statusCode = err.statusCode || 500;
    message = err.message || "Internal Server Error";
  } else {
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
