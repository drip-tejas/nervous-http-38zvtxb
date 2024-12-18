// src/types/qr.d.ts
import { RequestHandler } from "express";
import { IUser } from "./user";

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export interface GenerateQRBody {
  targetUrl: string;
  customIdentifier?: string;
}

export interface UpdateUrlBody {
  newUrl: string;
}

export type QRAuthHandler = RequestHandler<any, any, any, any, { user: IUser }>;
