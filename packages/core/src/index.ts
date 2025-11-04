/**
 * LiteAPI Hotel Map SDK
 *
 * A simple SDK for displaying hotel prices on interactive maps.
 * Completely abstracts the underlying map provider.
 */

import "mapbox-gl/dist/mapbox-gl.css";
  import { version } from "../package.json";
import { MapboxProvider } from "./providers/mapbox";
import type { MapInitOptions, CommonMapControls, State } from "./types";
import {
  hotelFeature,
  type HotelFeature,
  weatherFeature,
  type WeatherFeature,
} from "./features";

/**
 * Internal implementation of map initialization
 */
const mapInit = async (
  options: MapInitOptions
): Promise<HotelFeature & WeatherFeature & CommonMapControls> => {
  if (!options.selector) {
    throw new Error("selector is required");
  }

  const provider = new MapboxProvider();

  await provider.initialize({
    selector: options.selector,
    accessToken:
      "pk.eyJ1IjoiZmFyaGFkbmlheiIsImEiOiJjbWhkemp4emgwODBhMmlzYjcxcGd1dHN0In0.zNj_g870pLjrTpl-TjwX4w",
    style: options.style,
    center: options.center,
    zoom: options.zoom,
  });

  const state: State = { currentHotels: [] };

  const hotelFeature_ = hotelFeature(provider, state);
  const weatherFeature_ = weatherFeature(provider);
  const commonControls: CommonMapControls = {
    setCenter(lng: number, lat: number) {
      provider.setCenter(lng, lat);
    },

    setZoom(zoom: number) {
      provider.setZoom(zoom);
    },

    resize() {
      provider.resize();
    },

    getViewport() {
      return provider.getViewport();
    },

    destroy() {
      provider.destroy();
      state.currentHotels = [];
    },
  };
  const controls = {
    ...hotelFeature_,
    ...weatherFeature_,
    ...commonControls,
  };

  // Auto-load hotels if hotelsQuery is provided
  if (options.hotelsQuery) {
    await controls.loadHotels(options.hotelsQuery);
  }

  // Execute onLoad callback if provided
  if (options.onLoad) {
    await options.onLoad(controls);
  }

  return controls;
};

const LiteAPI = {
  /**
   * Map namespace
   */
  Map: {
    version,
    init: mapInit,
  },
};
export default LiteAPI;

export { mapInit };

export type {
  MapInitOptions,
  CommonMapControls,
  Hotel,
  Occupancy,
  Viewport,
  FetchHotelsParams,
  WeatherData,
  FetchWeatherParams,
} from "./types";

export { type HotelFeature, type WeatherFeature } from "./features";

export type { HeatmapPoint, HeatmapPaintStyle } from "./providers/types";
