// /backend/src/types/user.d.ts
export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}