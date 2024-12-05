// /backend/src/types/user.d.ts
export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
