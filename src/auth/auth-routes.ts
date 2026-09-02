import { body } from "express-validator";
import { AuthControllers } from "./auth-controllers.ts";
import { AppRoutesHandler } from "../lib/app-routes-middlewares.ts";
import { AppHelpers } from "../helpers/app-helpers.ts";

/**
 * @class AuthRoutes
 * @extends AppRoutesHandler
 * @description A class to handle the authentication-related routes for the application.
 * It sets up endpoints for user login, password reset requests, and password updates.
 */
export class AuthRoutes extends AppRoutesHandler {
  constructor() {
    super();
    this.featureRoutes();
  }

  /**
   * @private featureRoutes
   * @description Sets up the specific routes for authentication features, including their validation middleware.
   */
  private featureRoutes() {
    this.routes.post(
      "/login",
      AppHelpers.sanitizeBody,
      this.loginValidationRules(),
      this.checkValidationResult,
      AuthControllers.loginUserWithEmail,
    );

    this.routes.post(
      "/login/google",
      this.getGoogleLoginValidationRules(),
      this.checkValidationResult,
      AuthControllers.loginUserWithGoogle,
    );

    this.routes.post("/logout", this.authGuard, AuthControllers.logoutUser);
  }

  /**
   * @private getGogleLoginValidationRules
   * @description Returns an array of validation rules for the google login endpoin.
   * @returns {Array} An array of express-validator middleware.
   */

  private loginValidationRules() {
    return [
      body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required"),
      body("password").notEmpty().withMessage("Password is required"),
    ];
  }

  private getGoogleLoginValidationRules() {
    return [body("token").trim().notEmpty().withMessage("token is required")];
  }
}
