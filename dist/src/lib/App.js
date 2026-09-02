import express, {} from "express";
import { HttpException } from "./exceptions/http-exception.js";
import cookieParser from "cookie-parser";
import cors, {} from "cors";
import { createLogger, format, transports } from "winston";
import { rateLimit } from "express-rate-limit";
import { notFoundException } from "./exceptions/not-found-exception.js";
import { globalExceptionHandler } from "./exceptions/global-exception-handler.js";
const isVercel = process.env.VERCEL === "1";
const fileTransports = [
    new transports.File({
        filename: "logs/error.log",
        level: "error",
    }),
    new transports.File({ filename: "logs/combined.log" }),
];
export const logger = createLogger({
    level: "info",
    format: format.json(),
    transports: isVercel ? [new transports.Console()] : fileTransports,
    exceptionHandlers: isVercel
        ? [new transports.Console()]
        : [new transports.File({ filename: "logs/exceptions.log" })],
});
export class App {
    app;
    corsConfig;
    logger;
    limiter;
    constructor(corsConfig) {
        this.app = express();
        this.limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
            standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
            // store: ... , // Redis, Memcached, etc. See below.
            handler: (_, __, next, ___) => {
                next(new HttpException(429, "Too many requests"));
            },
        });
        this.corsConfig = corsConfig;
        this.middlewares();
        this.logger = logger;
        this.app.locals.logger = this.logger;
        // if (process.env.NODE_ENV !== "production") {
        //   this.logger.add(
        //     new transports.Console({
        //       format: format.simple(),
        //     }),
        //   );
        // }
        this.routes();
        this.errorHandlers();
    }
    middlewares() {
        this.app.use(this.limiter);
        this.app.use(cors(this.corsConfig));
        this.app.use(cookieParser());
        this.app.use(express.json({ limit: "100kb" }));
        this.app.use(express.urlencoded({ extended: true, limit: "100kb" }));
    }
    errorHandlers() {
        // @ts-ignore
        this.app.use(notFoundException);
        // @ts-ignore
        this.app.use(globalExceptionHandler);
    }
}
