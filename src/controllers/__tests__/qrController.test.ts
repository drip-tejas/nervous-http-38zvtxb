// /backend/src/controllers/__tests__/qrController.test.ts
import { Request, Response } from "express";
import { Socket } from "net";
import { trackScan } from "../qrController";
import { getLocationFromIP } from "../../utils/geoLocation";
import QRCode from "../../models/QRCode";

// Mock dependencies
jest.mock("../../utils/geoLocation");
jest.mock("../../models/QRCode");

const mockedGetLocation = getLocationFromIP as jest.MockedFunction<
  typeof getLocationFromIP
>;
const mockedQRCode = QRCode as jest.Mocked<typeof QRCode>;

describe("trackScan", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: { id: "test-qr-123" },
      ip: "1.1.1.1",
      headers: {
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
      },
      connection: new Socket(),
    };

    mockRes = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should track scan and redirect successfully", async () => {
    mockedGetLocation.mockResolvedValueOnce({
      country: "United States",
      city: "New York",
    });

    mockedQRCode.findOneAndUpdate.mockResolvedValueOnce({
      currentUrl: "https://example.com",
    } as any);

    await trackScan(mockReq as Request, mockRes as Response);

    expect(mockedGetLocation).toHaveBeenCalledWith("1.1.1.1");

    // Use expect.any(Date) for the timestamp
    expect(mockedQRCode.findOneAndUpdate).toHaveBeenCalledWith(
      { uniqueIdentifier: "test-qr-123" },
      {
        $push: {
          scans: expect.objectContaining({
            ipAddress: "1.1.1.1",
            deviceInfo: "Mobile",
            location: {
              country: "United States",
              city: "New York",
            },
            timestamp: expect.any(Date),
          }),
        },
      },
      { new: true }
    );

    expect(mockRes.redirect).toHaveBeenCalledWith("https://example.com");
  });

  it("should handle QR code not found", async () => {
    mockedGetLocation.mockResolvedValueOnce({});
    mockedQRCode.findOneAndUpdate.mockResolvedValueOnce(null);

    await trackScan(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "QR code not found" });
  });

  it("should handle missing IP address", async () => {
    const mockSocket = new Socket();
    Object.defineProperty(mockSocket, "remoteAddress", { value: undefined });

    mockReq = {
      ...mockReq,
      ip: undefined,
      connection: mockSocket,
    };

    mockedGetLocation.mockResolvedValueOnce({});
    mockedQRCode.findOneAndUpdate.mockResolvedValueOnce({
      currentUrl: "https://example.com",
    } as any);

    await trackScan(mockReq as Request, mockRes as Response);

    expect(mockedGetLocation).toHaveBeenCalledWith("0.0.0.0");
    expect(mockRes.redirect).toHaveBeenCalledWith("https://example.com");
  });
});
