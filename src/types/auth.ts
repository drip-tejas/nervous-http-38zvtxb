// backend/src/types/auth.ts
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: IUser;
}