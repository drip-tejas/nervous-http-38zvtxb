// /backend/src/types/custom.d.ts
declare namespace Express {
  export interface Request {
    user: {
      _id: string;
    };
  }
}
