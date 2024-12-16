// backend/src/types/express.d.ts
import { IUser } from "./user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};