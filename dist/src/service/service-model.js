import { Schema, model } from "mongoose";
const serviceSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    propertyType: { type: String, required: true },
    budget: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    address: { type: String, required: true },
    plan: { type: String, required: true, default: "one-time" },
    planInterval: { type: String, default: "weekly" },
    customer: {
        firstName: String,
        lastName: String,
        email: String,
        phoneNumber: String,
    },
    status: { type: String, required: true, default: "new" },
    planPeriod: { type: String },
    category: { type: String, required: true },
    serviceState: { type: String, required: true },
    serviceCity: { type: String, required: true },
    postcode: { type: String },
    preferredDate: { type: String },
    periodCovered: { type: String, default: "0" },
    isReviewed: { type: Boolean, default: false },
}, { timestamps: true });
export const Service = model("service", serviceSchema);
const feedbackSchema = new Schema({
    service: { type: Schema.Types.ObjectId, ref: "service", required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, required: true },
    rating: { type: String, required: true },
}, { timestamps: true });
export const Feedback = model("feedback", feedbackSchema);
