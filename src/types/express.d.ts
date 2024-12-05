import { Request } from "express";
import { IUser } from "./user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export type AuthRequest = Request & {
  user: IUser;
};

export type RequestWithAuth<T = any> = AuthRequest & {
  body: T;
  params: Record<string, string>;
};
