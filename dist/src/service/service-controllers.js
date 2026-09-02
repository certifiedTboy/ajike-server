import { ResponseHandler } from "../lib/response-handler.js";
import { ServiceServices } from "./service-services.js";
import eventEmitter from "../helpers/events.js";
export class ServiceControllers {
    /**
     * @static createService
     * @description Handles the creation of a new post.
     */
    static async createService(req, res, next) {
        try {
            const serviceData = { ...req.body, user: req.user?.id };
            eventEmitter.emitEvent("create-new-service", {
                id: `create-service-${serviceData.user}`,
                delayInMinutes: 0.5,
                serviceData,
            });
            ResponseHandler.created(res, 201, "Post created successfully", null);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static getServicesByUser
     * @description Handles fetching all services by a user with pagination.
     */
    static async getServicesByUser(req, res, next) {
        try {
            if (!req?.query?.page) {
                const page = 1;
                const limit = 30;
                const result = await ServiceServices.getServicesByUser(limit, page, req?.user?.id);
                ResponseHandler.ok(res, 200, "services fetched successfully", result);
            }
            else {
                const page = parseInt(req.query.page);
                const limit = 30;
                const result = await ServiceServices.getNewServicesByUser(limit, page, req?.user?.id);
                ResponseHandler.ok(res, 200, "services fetched successfully", result);
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static getAllServicesByAdmin
     * @description Handles fetching all services for an admin user.
     */
    static async getAllServicesByAdmin(req, res, next) {
        try {
            const page = parseInt(req.query.page);
            const limit = 2;
            const result = await ServiceServices.getAllServicesForAdmin(limit, page);
            ResponseHandler.ok(res, 200, "All services fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static updateService
     * @description Handles updating a service by both user and admin.
     */
    static async updateService(req, res, next) {
        try {
            const { serviceId } = req.params;
            const serviceData = { ...req.body, userId: req?.user?.id };
            eventEmitter.emitEvent("update-new-service", {
                id: `update-service-${serviceId}`,
                delayInMinutes: 0.5,
                serviceId,
                serviceData,
            });
            ResponseHandler.ok(res, 202, "Post update has been queued.");
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static getAllFeedbacks
     * @description handles get all feedbacks
     */
    static async addFeedback(req, res, next) {
        try {
            const serviceId = req.params.serviceId;
            const userId = req.user.id;
            eventEmitter.emitEvent("add-service-feedback", {
                id: `add-feedback-${serviceId}-${userId}`,
                delayInMinutes: 0.5,
                serviceId,
                userId,
                feedbackData: req.body,
            });
            return ResponseHandler.created(res, 202, "Comment has been queued.");
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @static getAllfeedbacks
     * @description Handles get all feedbacks.
     */
    static async getAllFeedbacks(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await ServiceServices.getAllFeedbacks(page, limit);
            ResponseHandler.ok(res, 202, "retrieved feedbacks successfully.", result);
        }
        catch (error) {
            next(error);
        }
    }
}
