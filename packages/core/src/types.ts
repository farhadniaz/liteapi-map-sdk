import type { HotelFeature, WeatherFeature } from "./features";

export type State = { currentHotels: Hotel[] };

export interface Occupancy {
  adults: number;
  children?: number[];
}

export interface Hotel {
  hotelId: string;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  hasAvailability: boolean;
  deepLink: string;
}

/**
 * Geographic viewport bounds
 */
export interface Viewport {
  south: number;
  west: number;
  north: number;
  east: number;
  high: {
    latitude: number;
    longitude: number;
  };
  low: {
    latitude: number;
    longitude: number;
  };
}

export interface PlaceHotelsResponse {
  viewport: Viewport;
  hotels: Hotel[];
}

export interface FetchHotelsParams {
  placeId: string;
  checkin: string;
  checkout: string;
  occupancies: Occupancy[];
  currency: string;
  guestNationality: string;
  proxyBaseURL: string;
}

/**
 * Weather data for a location
 */
export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city?: string;
}

/**
 * Parameters for fetching weather data
 */
export interface FetchWeatherParams {
  latitude: number;
  longitude: number;
  proxyBaseURL: string;
}

export interface MapInitOptions {
  selector: string;
  style?: string;
  center?: [number, number];
  zoom?: number;
  onLoad?: (controls: HotelFeature & WeatherFeature & CommonMapControls) => void | Promise<void>;

  /** Optional hotel query parameters for auto-loading hotels on initialization */
  hotelsQuery?: {
    placeId: string;
    checkin: string;
    checkout: string;
    occupancies: Occupancy[];
    currency: string;
    guestNationality: string;
    proxyBaseURL: string;
  };
}

/**
 * Common map control interface
 * Base interface with core map operations shared across all feature controls
 */
export interface CommonMapControls {
  /**
   * Set the map center coordinates (runtime customization)
   */
  setCenter(lng: number, lat: number): void;

  /**
   * Set the map zoom level (runtime customization)
   */
  setZoom(zoom: number): void;

  /**
   * Force the map to resize to fit its container
   * Useful when container size changes dynamically
   */
  resize(): void;

  /**
   * Get the current viewport bounds
   */
  getViewport(): Viewport;

  /**
   * Clean up and destroy the map instance
   */
  destroy(): void;
}
