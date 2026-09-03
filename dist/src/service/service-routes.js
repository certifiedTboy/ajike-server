import { body } from "express-validator";
import { ServiceControllers } from "./service-controllers.js";
import { AppRoutesHandler } from "../lib/app-routes-middlewares.js";
import { AppHelpers } from "../helpers/app-helpers.js";
import { HttpException } from "../lib/exceptions/http-exception.js";
/**
 * @class ServiceRoutes
 * @extends AppRoutesHandler
 * @description A class to handle user-related routes for the application.
 * It sets up endpoints for creating a new user, verifying an account, and fetching a user profile.
 */
export class ServiceRoutes extends AppRoutesHandler {
    constructor() {
        super();
        this.featureRoutes();
    }
    /**
     * @private featureRoutes
     * @description Sets up the specific routes for user features, including their validation and authentication middleware.
     */
    featureRoutes() {
        this.routes.post("/", this.authGuard, AppHelpers.sanitizeBody, this.getCreateServiceValidationRules(), this.checkValidationResult, ServiceControllers.createService);
        this.routes.get("/admin", this.adminGuard, ServiceControllers.getAllServicesByAdmin);
        this.routes.get("/user", this.authGuard, ServiceControllers.getServicesByUser);
        this.routes.get("/user/completed-services", this.authGuard, ServiceControllers.getAllCompletedServicesByUser);
        this.routes.post("/:serviceId/feedback", this.authGuard, this.getFeedbackValidationRules(), this.checkValidationResult, ServiceControllers.addFeedback);
        this.routes.get("/feedback", this.adminGuard, ServiceControllers.getAllFeedbacks);
        this.routes.put("/:serviceId", this.authGuard, AppHelpers.sanitizeBody, this.getCreateServiceValidationRules(), this.checkValidationResult, ServiceControllers.updateService);
    }
    /**
     * @private getCreateUserValidationRules
     * @description Returns an array of validation rules for the user creation endpoint.
     * @returns {Array} An array of express-validator middleware.
     */
    getCreateServiceValidationRules() {
        return [
            body("title")
                .trim()
                .isString()
                .withMessage("title must be a string")
                .notEmpty()
                .withMessage("service title is required"),
            body("description")
                .trim()
                .isString()
                .withMessage("description must be a string")
                .notEmpty()
                .withMessage("Service description is required"),
            body("propertyType")
                .trim()
                .isString()
                .withMessage("Property type must be a string")
                .notEmpty()
                .withMessage("property type is required"),
            body("budget")
                .trim()
                .isString()
                .withMessage("Budget must be a string")
                .notEmpty()
                .withMessage("budget is required"),
            body("address")
                .trim()
                .isString()
                .withMessage("Address must be a string")
                .notEmpty()
                .withMessage("Address is required"),
            body("plan")
                .trim()
                .isString()
                .withMessage("Plan must be a string")
                .notEmpty()
                .withMessage("Plan is required"),
            body("category")
                .trim()
                .isString()
                .withMessage("Plan must be a string")
                .notEmpty()
                .withMessage("category is required"),
            body("status")
                .trim()
                .isString()
                .withMessage("Service Status must be a string")
                .notEmpty()
                .withMessage("Service status is required"),
            body("serviceState")
                .trim()
                .isString()
                .withMessage("Service state must be a string")
                .notEmpty()
                .withMessage("Service state is required"),
            body("serviceCity")
                .trim()
                .isString()
                .withMessage("City must be a string")
                .notEmpty()
                .withMessage("City is required"),
            body("postcode")
                .optional()
                .isString()
                .withMessage("postcode must be a string")
                .trim()
                .matches(/^\d{5}(-\d{4})?$/)
                .withMessage("Enter a valid post code"),
            body("preferredDate")
                .notEmpty()
                .withMessage("Service preferred dated is required")
                .custom((value, { req }) => {
                const timeZone = req?.body?.timeZone;
                try {
                    Intl.DateTimeFormat("en-US", {
                        timeZone,
                    }).format();
                }
                catch {
                    throw new HttpException(400, "Invalid timezone");
                }
                const todayString = new Intl.DateTimeFormat("en-CA", {
                    timeZone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }).format(new Date());
                // YYYY-MM-DD strings can be compared lexicographically
                if (value < todayString) {
                    throw new HttpException(400, "Date cannot be in the past");
                }
                // Calculate maximum date
                const [year, month, day] = todayString.split("-").map(Number);
                const maxDate = new Date(Date.UTC(year, month - 1, day));
                maxDate.setUTCDate(maxDate.getUTCDate() + 7);
                const maxDateString = maxDate.toISOString().slice(0, 10);
                if (value < maxDateString) {
                    throw new HttpException(400, "Date must be more than 7 days from today");
                }
                // Determine day of week in client's timezone
                const [selectedYear, selectedMonth, selectedDay] = value
                    .split("-")
                    .map(Number);
                const selectedDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, selectedDay));
                // Sunday = 0
                if (selectedDate.getUTCDay() === 0) {
                    throw new HttpException(400, "Sundays are not available");
                }
                return true;
            }),
        ];
    }
    /**
     * @private getFeedbackValidationRules
     * @description Returns an array of validation rules for feedback update.
     * @returns {Array} An array of express-validator middleware.
     */
    getFeedbackValidationRules() {
        return [
            body("text")
                .trim()
                .notEmpty()
                .withMessage("text is required")
                .isString()
                .withMessage("text must be a string"),
            body("rating").notEmpty().withMessage("rating is required"),
        ];
    }
}
