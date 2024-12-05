// /backend/src/config/index.ts
interface Config {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  corsOrigin: string;
  nodeEnv: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "8000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/dripqr",
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
