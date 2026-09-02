import { Schema, model, type Model, type Document } from "mongoose";

export type ServiceType = "re-occurrent" | "one-time";
export type CategoryType = "Pest | Cleaning" | "Both";
export type ServiceStatusType = "completed" | "pending" | "cancelled" | "new";
export type PlanIntervalType = "weekly" | "monthly" | "quarterly" | "yearly";
export type StateType = "New York" | "New Jersey";
export type CityType =
  | "New York"
  | "Buffalo"
  | "Rochester"
  | "Yonkers"
  | "Syracuse"
  | "Albany"
  | "New Rochelle"
  | "Mount Vernon"
  | "Schenectady"
  | "Utica"
  | "Newark"
  | "Jersey City"
  | "Paterson"
  | "Elizabeth"
  | "Edison"
  | "Woodbridge"
  | "Lakewood"
  | "Toms River"
  | "Clifton"
  | "Camden";

export interface IService extends Document {
  title: string;
  description: string;
  propertyType: string;
  budget: string;
  user: Schema.Types.ObjectId;
  customer: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  address: string;
  plan: ServiceType;
  status: ServiceStatusType;
  category: CategoryType;
  preferredDate: string;
  planInterval: PlanIntervalType;
  planPeriod: string;
  periodCovered: string;
  serviceState: StateType;
  serviceCity: CityType;
  postcode: string;
}

const serviceSchema = new Schema<IService>(
  {
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
  },
  { timestamps: true },
);

export const Service: Model<IService> = model<IService>(
  "service",
  serviceSchema,
);

export interface IFeedback extends Document {
  service: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  text: string;
  rating: string;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    service: { type: Schema.Types.ObjectId, ref: "service", required: true },
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, required: true },
    rating: { type: String, required: true },
  },
  { timestamps: true },
);

export const Feedback: Model<IFeedback> = model<IFeedback>(
  "feedback",
  feedbackSchema,
);
