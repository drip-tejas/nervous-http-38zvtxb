// /backend/src/utils/geoLocation.ts
import axios from "axios";

interface GeoLocation {
  country?: string;
  city?: string;
}

interface IPAPIResponse {
  status: string;
  country: string;
  city: string;
  // Add other fields if needed
}

export async function getLocationFromIP(ip: string): Promise<GeoLocation> {
  try {
    // Remove any IPv6 prefix if present
    const cleanIP = ip.replace(/^::ffff:/, "");

    // Skip lookup for localhost/development
    if (cleanIP === "127.0.0.1" || cleanIP === "localhost") {
      return {};
    }

    const response = await axios.get<IPAPIResponse>(
      `http://ip-api.com/json/${cleanIP}`
    );

    if (response.data.status === "success") {
      return {
        country: response.data.country,
        city: response.data.city,
      };
    }
    return {};
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return {};
  }
}
