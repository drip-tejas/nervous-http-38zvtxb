import QRCode from "qrcode";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("123456789abcdefghijklmnopqrstuvwxyz", 8);

export const generateQRCodeImage = async (url: string): Promise<Buffer> => {
  return await QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 400,
  });
};

export const generateShortIdentifier = async (): Promise<string> => {
  return nanoid();
};
