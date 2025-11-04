/**
 * API client for fetching hotel data and weather data from the BFF
 */

import type {
  FetchHotelsParams,
  PlaceHotelsResponse,
  FetchWeatherParams,
  WeatherData,
} from "./types";

const normalizeBaseURL = (url: string): string => {
  return url.endsWith("/") ? url : `${url}/`;
};

/**
 * Fetch hotels for a given place with availability and pricing
 */
export const fetchPlaceHotels = async (
  params: FetchHotelsParams
): Promise<PlaceHotelsResponse> => {
  const { placeId, proxyBaseURL, ...requestData } = params;

  // Validate required parameters
  if (!proxyBaseURL) {
    throw new Error("proxyBaseURL is required");
  }

  if (!placeId) {
    throw new Error("placeId is required");
  }
 
  const baseURL = normalizeBaseURL(proxyBaseURL);
  const url = `${baseURL}api/map/places/${placeId}/hotels`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch hotels: ${response.status} ${response.statusText}${
          errorText ? ` - ${errorText}` : ""
        }`
      );
    }

    const data: PlaceHotelsResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching hotels");
  }
};

/**
 * Fetch weather data for a specific location
 */
export const fetchWeather = async (
  params: FetchWeatherParams
): Promise<WeatherData> => {
  const { latitude, longitude, proxyBaseURL } = params;

  // Validate required parameters
  if (!proxyBaseURL) {
    throw new Error("proxyBaseURL is required");
  }

  if (latitude === undefined || longitude === undefined) {
    throw new Error("latitude and longitude are required");
  }

  const baseURL = normalizeBaseURL(proxyBaseURL);
  const url = `${baseURL}api/weather?lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch weather: ${response.status} ${response.statusText}${
          errorText ? ` - ${errorText}` : ""
        }`
      );
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching weather");
  }
};
