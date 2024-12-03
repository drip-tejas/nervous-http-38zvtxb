// src/models/QRCode.ts
import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IQRCode extends Document {
  user: mongoose.Types.ObjectId;
  targetUrl: string;
  currentUrl: string;
  customIdentifier?: string;
  uniqueIdentifier: string;
  urlHistory: Array<{
    url: string;
    changedAt: Date;
  }>;
  scans: Array<{
    timestamp: Date;
    ipAddress?: string;
    deviceInfo?: string;
    location?: {
      country?: string;
      city?: string;
    };
  }>;
  createdAt: Date;
}

const QRCodeSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true,
  },
  currentUrl: {
    type: String,
    required: true,
    trim: true,
  },
  customIdentifier: {
    type: String,
    unique: true,
    sparse: true,
  },
  uniqueIdentifier: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  urlHistory: [{
    url: String,
    changedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  scans: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    deviceInfo: String,
    location: {
      country: String,
      city: String,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IQRCode>("QRCode", QRCodeSchema);