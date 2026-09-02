import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { HttpException } from "./exceptions/http-exception.ts";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import { createLogger, format, transports, type Logger } from "winston";
import { rateLimit } from "express-rate-limit";
import { notFoundException } from "./exceptions/not-found-exception.ts";
import { globalExceptionHandler } from "./exceptions/global-exception-handler.ts";

const isVercel = process.env.VERCEL === "1";
const loggerTransports = isVercel
  ? [new transports.Console()]
  : [
      new transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
      new transports.File({ filename: "logs/combined.log" }),
    ];

export const logger: Logger = createLogger({
  level: "info",
  format: format.json(),
  transports: loggerTransports,

  exceptionHandlers: isVercel
    ? [new transports.Console()]
    : [new transports.File({ filename: "logs/exceptions.log" })],
});

export abstract class App {
  public app: Application;
  public corsConfig: CorsOptions;
  public logger: Logger;
  public limiter: any;

  constructor(corsConfig: CorsOptions, application: Application = express()) {
    this.app = application;
    this.app.set("trust proxy", 1);
    this.limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
      standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
      ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
      // store: ... , // Redis, Memcached, etc. See below.

      handler: (_: Request, __: Response, next: NextFunction, ___: any) => {
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

  private middlewares() {
    this.app.use(this.limiter);
    this.app.use(cors(this.corsConfig));
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: "100kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  }

  private errorHandlers() {
    // @ts-ignore
    this.app.use(notFoundException);
    // @ts-ignore
    this.app.use(globalExceptionHandler);
  }

  public abstract routes(): void;
}
