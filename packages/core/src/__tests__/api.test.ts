import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { fetchPlaceHotels, fetchWeather } from "../api";

globalThis.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("fetchPlaceHotels", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when required params are missing", async () => {
    await expect(
      fetchPlaceHotels({
        placeId: "",
        proxyBaseURL: "http://localhost:3001",
        checkin: "",
        checkout: "",
        occupancies: [],
        guestNationality: "",
        currency: "",
      })
    ).rejects.toThrow();
  });

  it("should handle HTTP errors", async () => {
    (
      globalThis.fetch as jest.MockedFunction<typeof fetch>
    ).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Error",
    } as Response);

    await expect(
      fetchPlaceHotels({
        placeId: "test",
        proxyBaseURL: "http://localhost:3001",
        checkin: "",
        checkout: "",
        occupancies: [],
        guestNationality: "",
        currency: "",
      })
    ).rejects.toThrow();
  });
});

describe("fetchWeather", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when required params are missing", async () => {
    await expect(
      fetchWeather({
        latitude: undefined as any,
        longitude: 2,
        proxyBaseURL: "",
      })
    ).rejects.toThrow();
  });
});
