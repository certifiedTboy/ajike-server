import dotenv from "dotenv";

dotenv.config();
export const CLIENT_URL = process.env.CLIENT_URL;

export const PORT = process.env.PORT;
export const DB_URI = process.env.MONGO_URL;

export const EMAIL_FROM = process.env.EMAIL_FROM;
export const SMTP_API_KEY = process.env.SMTP_API_KEY;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;

export const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
export const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
