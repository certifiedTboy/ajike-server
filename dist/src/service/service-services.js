import { Types } from "mongoose";
import { HttpException } from "../lib/exceptions/http-exception.js";
import eventEmitter from "../helpers/events.js";
import { Service, Feedback, } from "./service-model.js";
import moment from "moment";
import { UserServices } from "../users/user-services.js";
export class ServiceServices {
    /**
     * @static createService
     * @description Creates a service request.
     * @param {IService} serviceData - The data for the new post.
     * @returns {Promise<IService>} A promise that resolves to the new post.
     */
    static async createService(serviceData) {
        const service = new Service(serviceData);
        await service.save();
        eventEmitter.emitEvent("create-service", {
            id: `create-service-${service._id}`,
            delayInMinutes: 0.5,
            serviceId: service._id,
            serviceData: service,
        });
        await UserServices.updateUserData({ _id: service?.user }, { $inc: { serviceCount: 1 } });
        return service;
    }
    /**
     * @static getServicesByUser
     * @description Retrieves a list of services with pagination.
     * @param {number} limit - The number of posts to return.
     * @param {number} page - The page number.
     * @param {string} userId - id of the user
     * @returns {Promise<{services: IService[], total: number}>} A promise that resolves to the posts and total count.
     */
    static async getServicesByUser(limit, page, userId) {
        const userObjectId = new Types.ObjectId(userId);
        const today = new Date().toISOString().split("T")[0];
        const [services, stats] = await Promise.all([
            // Paginated services
            // @ts-ignore
            Service.find({ user: userObjectId })
                .populate("user", "firstName lastName email phoneNumber role picture")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * (page - 1)),
            // Statistics + next visits
            Service.aggregate([
                {
                    $match: {
                        user: userObjectId,
                    },
                },
                {
                    $facet: {
                        // -----------------------------
                        // SERVICE STATISTICS
                        // -----------------------------
                        statistics: [
                            {
                                $group: {
                                    _id: null,
                                    totalRecords: {
                                        $sum: 1,
                                    },
                                    new: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: [{ $toLower: "$status" }, "new"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    completed: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: [{ $toLower: "$status" }, "completed"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    cancelled: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: [{ $toLower: "$status" }, "cancelled"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    pending: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: [{ $toLower: "$status" }, "pending"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                        // -----------------------------
                        // NEXT RE-OCCURRING SERVICE
                        // -----------------------------
                        recurringService: [
                            {
                                $match: {
                                    status: { $regex: /^pending$/i },
                                    plan: { $regex: /^re-occurrent$/i },
                                    preferredDate: {
                                        $gte: today,
                                    },
                                },
                            },
                            {
                                $sort: {
                                    preferredDate: 1,
                                },
                            },
                            {
                                $limit: 1,
                            },
                        ],
                        // -----------------------------
                        // NEXT VISIT
                        // -----------------------------
                        nextVisit: [
                            {
                                $match: {
                                    status: { $regex: /^pending$/i },
                                    preferredDate: {
                                        $gte: today,
                                    },
                                },
                            },
                            {
                                $sort: {
                                    preferredDate: 1,
                                },
                            },
                            {
                                $limit: 1,
                            },
                        ],
                    },
                },
            ]),
        ]);
        const serviceStats = stats[0]?.statistics[0] ?? {
            new: 0,
            completed: 0,
            cancelled: 0,
            pending: 0,
        };
        const nextVisit = stats[0]?.nextVisit[0] ?? null;
        const recurringService = stats[0]?.recurringService[0] ?? null;
        return {
            services,
            nextVisit,
            recurringService,
            serviceStats,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(serviceStats.totalRecords / limit),
            },
        };
    }
    /**
     * @static getCompletedServicesByUser
     * @description Retrieves a list of completed services by a user.
     * @param {string} userId - id of the user
     */
    static async getCompletedServicesByUser(userId) {
        const userObjectId = new Types.ObjectId(userId);
        const services = Service.find({
            // @ts-ignore
            user: userObjectId,
            status: "completed",
            isReviewed: false,
        }).populate("user", "firstName lastName email phoneNumber role picture");
        return services;
    }
    /**
     * @static getNewServicesByUser
     * @description Retrieves a list of services with pagination.
     * @param {number} limit - The number of posts to return.
     * @param {number} page - The page number.
     * @param {string} userId - id of the user
     * @returns {Promise<{services: IService[], total: number}>} A promise that resolves to the posts and total count.
     */
    static async getNewServicesByUser(limit, page, userId) {
        const userObjectId = new Types.ObjectId(userId);
        // @ts-ignore
        const services = Service.find({ user: userObjectId })
            .populate("user", "firstName lastName email phoneNumber role picture")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(limit * (page - 1));
        return services;
    }
    /**
     * @static getAllServicesForAdmin
     * @description Retrieves all services for an admin user with pagination.
     * @param {number} limit - The number of posts to return.
     * @param {number} page - The page number.
     */
    static async getAllServicesForAdmin(limit, page) {
        if (page === 1) {
            const skip = limit * (page - 1);
            const result = await Service.aggregate([
                {
                    $facet: {
                        // Paginated services
                        services: [
                            {
                                $sort: {
                                    createdAt: -1,
                                },
                            },
                            {
                                $skip: skip,
                            },
                            {
                                $limit: limit,
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "user",
                                    foreignField: "_id",
                                    as: "user",
                                },
                            },
                            {
                                $unwind: {
                                    path: "$user",
                                    preserveNullAndEmptyArrays: true,
                                },
                            },
                            {
                                $project: {
                                    "user.password": 0,
                                    "user.otp": 0,
                                    "user.otpExpiry": 0,
                                },
                            },
                        ],
                        // Statistics for ALL services
                        statistics: [
                            {
                                $addFields: {
                                    // Convert "100", "20", etc. into numbers
                                    budgetNumber: {
                                        $convert: {
                                            input: "$budget",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0,
                                        },
                                    },
                                    normalizedStatus: {
                                        $toLower: {
                                            $ifNull: ["$status", ""],
                                        },
                                    },
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    // ALL SERVICES
                                    totalServices: {
                                        $sum: 1,
                                    },
                                    // Total value of ALL services
                                    totalValue: {
                                        $sum: "$budgetNumber",
                                    },
                                    // PENDING
                                    totalPendingServices: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "pending"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    totalPendingValue: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "pending"],
                                                },
                                                "$budgetNumber",
                                                0,
                                            ],
                                        },
                                    },
                                    // NEW
                                    totalNewServices: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "new"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    totalNewValue: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "new"],
                                                },
                                                "$budgetNumber",
                                                0,
                                            ],
                                        },
                                    },
                                    // COMPLETED
                                    totalCompletedServices: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "completed"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    totalCompletedValue: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "completed"],
                                                },
                                                "$budgetNumber",
                                                0,
                                            ],
                                        },
                                    },
                                    // CANCELLED
                                    totalCancelledServices: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "cancelled"],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    totalCancelledValue: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $eq: ["$normalizedStatus", "cancelled"],
                                                },
                                                "$budgetNumber",
                                                0,
                                            ],
                                        },
                                    },
                                },
                            },
                            // Remove MongoDB's _id from statistics
                            {
                                $project: {
                                    _id: 0,
                                },
                            },
                        ],
                    },
                },
            ]);
            const services = result[0]?.services ?? [];
            const statistics = result[0]?.statistics[0] ?? {
                totalServices: 0,
                totalValue: 0,
                totalPendingServices: 0,
                totalPendingValue: 0,
                totalNewServices: 0,
                totalNewValue: 0,
                totalCompletedServices: 0,
                totalCompletedValue: 0,
            };
            return {
                services,
                statistics,
                pagination: {
                    page,
                    limit,
                    totalRecords: statistics.totalServices,
                    totalPages: Math.ceil(statistics.totalServices / limit),
                },
            };
        }
        else {
            const services = await Service.find()
                .populate("user", "firstName lastName email picture isVerified")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * (page - 1));
            return services;
        }
    }
    /**
     * @static updateService
     * @description Updates an existing service.
     * @param {string} serviceId - The ID of the post to update.
     * @param {Partial<IService>} serviceData - The data to update the service with.
     * @returns {Promise<IService>} A promise that resolves to the updated post.
     */
    static async updateService(serviceId, serviceData, userId) {
        const service = await Service.findByIdAndUpdate(serviceId, serviceData, {
            new: true,
        });
        if (!service) {
            throw new HttpException(404, "Service update failed");
        }
        eventEmitter.emitEvent("update-service", {
            id: `update-service-${service._id}-${userId}`,
            delayInMinutes: 0.5,
            serviceId: service._id,
            serviceData: service,
        });
        return service;
    }
    /**
     * @static giveFeedback
     * @description give feedback to a service.
     * @param {string} serviceId - The ID of the service to add feeback.
     * @param {string} userId - Id of the user.
     * @param {string} text - The feedback.
     * @param {string} rating - number rating of the feedback
     * @returns {Promise<IFeeback>} A promise that resolves to the new feedback.
     */
    static async giveFeedback(serviceId, userId, text, rating = null, updateServiceData) {
        const feedback = new Feedback({
            service: serviceId,
            user: userId,
            text,
            rating,
        });
        await feedback.save();
        await this.updateService(serviceId, { ...updateServiceData, isReviewed: true }, userId);
        return feedback;
    }
    /**
     * @static getFeedbacks
     * @description Retrieves all feedbacks.
     * @param {number} limit - The number of comments to return.
     * @param {number} page - The page number.
     */
    static async getAllFeedbacks(page, limit) {
        if (page === 1) {
            const skip = limit * (page - 1);
            const [result, completedServices] = await Promise.all([
                Feedback.aggregate([
                    {
                        $facet: {
                            // ==========================================
                            // PAGINATED FEEDBACKS
                            // ==========================================
                            feedbacks: [
                                {
                                    $sort: {
                                        createdAt: -1,
                                    },
                                },
                                {
                                    $skip: skip,
                                },
                                {
                                    $limit: limit,
                                },
                                // Populate user
                                {
                                    $lookup: {
                                        from: "users",
                                        localField: "user",
                                        foreignField: "_id",
                                        as: "user",
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$user",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                // Populate service
                                {
                                    $lookup: {
                                        from: "services",
                                        localField: "service",
                                        foreignField: "_id",
                                        as: "service",
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$service",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $project: {
                                        "user.password": 0,
                                        "user.otp": 0,
                                        "user.otpExpiry": 0,
                                    },
                                },
                            ],
                            // ==========================================
                            // RATING STATISTICS
                            // ==========================================
                            ratingStatistics: [
                                {
                                    $addFields: {
                                        ratingNumber: {
                                            $convert: {
                                                input: "$rating",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        totalFeedbacks: {
                                            $sum: 1,
                                        },
                                        // 5 stars
                                        totalFiveStars: {
                                            $sum: {
                                                $cond: [{ $eq: ["$ratingNumber", 5] }, 1, 0],
                                            },
                                        },
                                        // 4 stars
                                        totalFourStars: {
                                            $sum: {
                                                $cond: [{ $eq: ["$ratingNumber", 4] }, 1, 0],
                                            },
                                        },
                                        // 3 stars
                                        totalThreeStars: {
                                            $sum: {
                                                $cond: [{ $eq: ["$ratingNumber", 3] }, 1, 0],
                                            },
                                        },
                                        // 2 stars
                                        totalTwoStars: {
                                            $sum: {
                                                $cond: [{ $eq: ["$ratingNumber", 2] }, 1, 0],
                                            },
                                        },
                                        // 1 star
                                        totalOneStar: {
                                            $sum: {
                                                $cond: [{ $eq: ["$ratingNumber", 1] }, 1, 0],
                                            },
                                        },
                                        // Average rating
                                        totalRating: {
                                            $sum: "$ratingNumber",
                                        },
                                    },
                                },
                                {
                                    $addFields: {
                                        averageRating: {
                                            $cond: [
                                                { $gt: ["$totalFeedbacks", 0] },
                                                {
                                                    $divide: ["$totalRating", "$totalFeedbacks"],
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                },
                                {
                                    $project: {
                                        totalRating: 0,
                                    },
                                },
                            ],
                        },
                    },
                ]),
                Service.countDocuments({
                    status: "completed",
                }),
            ]);
            return { ...result, completedServices };
        }
        else {
            const feedbacks = await Feedback.find()
                .populate("user", "-password")
                .populate("service")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * (page - 1));
            return feedbacks;
        }
    }
}
