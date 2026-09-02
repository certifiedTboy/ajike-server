import type { Request, Response } from "express";

export function notFoundException(req: Request, res: Response) {
  res.status(404).json({
    error: "enpoint does not exist",
    path: req.originalUrl,
    method: req.method,
  });
}
