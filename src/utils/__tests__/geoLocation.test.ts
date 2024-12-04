// /backend/src/utils/__tests__/geoLocation.test.ts
import { getLocationFromIP } from "../geoLocation";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getLocationFromIP", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ... rest of the tests remain the same

  it("should handle API errors gracefully", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));
    const location = await getLocationFromIP("1.1.1.1");
    expect(location).toEqual({});
    expect(consoleSpy).toHaveBeenCalled();
  });
});
