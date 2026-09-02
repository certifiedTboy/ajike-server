// import { type IService } from "../service/service-model.ts";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  picture?: string;
  role?: string;
  confirmPassword?: string | undefined;
}

// export interface IEventData {
//   id: string;
//   delayInMinutes: number;
//   firstName?: string;
//   email?: string;
//   otp?: string;
//   serviceData?: IService;
// }
export interface IEventData {
  id: string;
  delayInMinutes: number;
  [key: string]: any;
}

export type EventTypes =
  | "new-user"
  | "user-verified"
  | "password-reset"
  | "password-changed"
  | "create-service"
  | "update-service"
  | "create-new-service"
  | "update-new-service"
  | "add-service-feedback";

export interface IJWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ICommentEvent extends IEventData {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}

export interface IUpdateCommentEvent extends IEventData {
  commentId: string;
  content: string;
}
