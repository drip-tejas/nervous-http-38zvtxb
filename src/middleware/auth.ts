import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../types/user";

interface JWTPayload {
  userId: string;
}

declare module "express" {
  interface Request {
    user?: IUser;
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Add user ID to request
    req.user = { _id: decoded.userId } as IUser;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
