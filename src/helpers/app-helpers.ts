import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import perfectExpressSanitizer from "perfect-express-sanitizer";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { DB_URI } from "../lib/constants.ts";

// Promisify the scrypt function from the crypto module for async/await usage.
const scryptAsync = promisify(scrypt);

/**
 * @class AppHelpers
 * @description Provides a collection of static helper methods for common application-wide tasks,
 * such as generating OTPs, managing database connections, and handling password hashing and verification.
 */
export class AppHelpers {
  /**
   * @static
   * @method generateOTP
   * @description Generates a random 6-digit One-Time Password (OTP) as a string.
   * @returns {string} A 6-digit OTP string.
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * @static
   * @async
   * @method connectDb
   * @description Establishes a connection to the MongoDB database using the URI from environment variables.
   * Logs a success message on connection or an error if it fails.
   * @returns {Promise<void>} A promise that resolves when the connection is successful.
   * @throws {Error} If the DB_URI is not defined in the environment variables.
   */
  static async connectDb(): Promise<void> {
    if (!DB_URI) throw new Error("DB_URI is not defined");

    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(DB_URI);
    console.log("connected to database");
  }

  /**
   * @static
   * @async
   * @method hashPassword
   * @description Hashes a plain-text password using the scrypt key derivation function.
   * A random salt is generated for each password to ensure unique hashes.
   * @param {string} password - The plain-text password to hash.
   * @returns {Promise<string>} A promise that resolves to a string containing the hashed password and the salt, separated by a dot.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");

    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buffer.toString("hex")}.${salt}`;
  }

  /**
   * @static
   * @async
   * @method verifyPassword
   * @description Verifies a provided password against a stored hash.
   * It extracts the salt from the stored hash and re-hashes the provided password to check for a match.
   * @param {string} providedPassword - The password to verify.
   * @param {string} storedPassword - The stored hash (including the salt).
   * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, otherwise false.
   */
  static async verifyPassword(
    providedPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split(".");

    const buffer = (await scryptAsync(providedPassword, salt!, 64)) as Buffer;

    return buffer.toString("hex") === hashedPassword;
  }

  /**
   * @static
   * @method sanitizeBody
   * @description sanitize all body data using express data validation
   */
  static sanitizeBody(req: Request, _res: Response, next: NextFunction) {
    const options = { xss: true, noSql: true, sql: true, level: 5 };

    if (req?.body?.password || req?.body?.confirmPassword) {
      const data = {
        password: req?.body?.password,
        confirmPassword: req?.body?.confirmPassword,
      };

      delete req?.body?.password;
      delete req?.body?.confirmPassword;

      perfectExpressSanitizer.sanitize.prepareSanitize(req.body, options);

      req.body = { ...req.body, ...data };
    } else {
      perfectExpressSanitizer.sanitize.prepareSanitize(req.body, options);
    }

    next();
  }
}
