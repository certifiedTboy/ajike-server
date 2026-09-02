import { body } from "express-validator";
import { UserControllers } from "./user-controllers.ts";
import { AppHelpers } from "../helpers/app-helpers.ts";
import { AppRoutesHandler } from "../lib/app-routes-middlewares.ts";

/**
 * @class UserRoutes
 * @extends AppRoutesHandler
 * @description A class to handle user-related routes for the application.
 * It sets up endpoints for creating a new user, verifying an account, and fetching a user profile.
 */
export class UserRoutes extends AppRoutesHandler {
  constructor() {
    super();
    this.featureRoutes();
  }

  /**
   * @private featureRoutes
   * @description Sets up the specific routes for user features, including their validation and authentication middleware.
   */
  private featureRoutes() {
    this.routes.post(
      "/",
      AppHelpers.sanitizeBody,
      this.getCreateUserValidationRules(),
      this.checkValidationResult,
      UserControllers.createNewUser,
    );
    this.routes.patch(
      "/verify",
      AppHelpers.sanitizeBody,
      this.getVerifyUserValidationRules(),
      this.checkValidationResult,
      UserControllers.verifyUserAccount,
    );

    this.routes.get(
      "/profile",
      this.authGuard,
      UserControllers.getCurrentUserProfile,
    );

    this.routes.patch(
      "/reset-password",
      AppHelpers.sanitizeBody,
      this.getPasswordResetRequestValidationRules(),
      this.checkValidationResult,
      UserControllers.requestPasswordReset,
    );

    this.routes.patch(
      "/update-password",
      AppHelpers.sanitizeBody,

      this.getUpdatePasswordValidationRules(),
      this.checkValidationResult,
      UserControllers.updatePassword,
    );

    this.routes.get("/", this.adminGuard, UserControllers.getAllUsers);
    this.routes.delete(
      "/delete",
      this.authGuard,
      UserControllers.deleteUserAccount,
    );
    this.routes.post(
      "/news-letters",
      AppHelpers.sanitizeBody,
      this.getNewsLettersValidationRules(),
      this.checkValidationResult,
      UserControllers.addNewEmailToNewLetters,
    );
    this.routes.delete(
      "/news-letters",
      this.getNewsLettersValidationRules(),
      this.checkValidationResult,
      UserControllers.removeEmailFromNewsLetter,
    );

    this.routes.get(
      "/news-letters/all",
      this.adminGuard,
      UserControllers.getAllNewsLetterEmails,
    );
  }

  /**
   * @private getCreateUserValidationRules
   * @description Returns an array of validation rules for the user creation endpoint.
   * @returns {Array} An array of express-validator middleware.
   */
  private getCreateUserValidationRules() {
    return [
      body("firstName").trim().notEmpty().withMessage("first name is required"),
      body("lastName").trim().notEmpty().withMessage("last name is required"),
      body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("invalid email address"),
      body("phoneNumber")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("en-US")
        .withMessage("Please provide a valid US phone number"),
      body("password")
        .trim()
        .notEmpty()
        .withMessage("password is required")
        .matches(/^.{8,}$/)
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/)
        .withMessage("Password must contain at least one special character"),

      body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),

      body("consent")
        .isBoolean()
        .equals("true")
        .withMessage("Accept our terms and privacy policy"),
    ];
  }

  /**
   * @private getVerifyUserValidationRules
   * @description Returns an array of validation rules for the user verification endpoint.
   * @returns {Array} An array of express-validator middleware.
   */
  private getVerifyUserValidationRules() {
    return [
      body("otp")
        .trim()
        .notEmpty()
        .withMessage("otp is required")
        .matches(/^[0-9]{6}$/)
        .withMessage("Invalid otp"),
    ];
  }

  private getPasswordResetRequestValidationRules() {
    return [
      body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("invalid email address"),
    ];
  }

  private getUpdatePasswordValidationRules() {
    return [
      body("otp")
        .trim()
        .notEmpty()
        .withMessage("otp is required")
        .matches(/^[0-9]{6}$/)
        .withMessage("Invalid otp"),
      body("password")
        .trim()
        .notEmpty()
        .withMessage("password is required")
        .matches(/^.{8,}$/)
        .withMessage("Password must be at least 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/)
        .withMessage("Password must contain at least one special character"),
      body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
    ];
  }

  private getNewsLettersValidationRules() {
    return [
      body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("invalid email address"),
    ];
  }
}
