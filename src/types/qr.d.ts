/*
import { Request, Response } from "express";
import { IUser } from "./user";

export interface GenerateQRBody {
  targetUrl: string;
  customIdentifier?: string;
}

export interface UpdateUrlBody {
  newUrl: string;
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

export type QRController = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void>;
*/

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
