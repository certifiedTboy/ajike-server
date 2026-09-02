import app from "../src/app.ts";
import { AppHelpers } from "../src/helpers/app-helpers.ts";
import type { Request, Response } from "express";

let databaseConnection: Promise<void> | undefined;

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  databaseConnection ??= AppHelpers.connectDb().catch((error: unknown) => {
    databaseConnection = undefined;
    throw error;
  });

  await databaseConnection;
  app(req, res);
}
