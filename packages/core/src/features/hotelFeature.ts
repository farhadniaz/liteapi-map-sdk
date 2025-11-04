import { fetchPlaceHotels } from "../api";

import type { FetchHotelsParams, State, Hotel } from "../types";
import type { MapProvider, MarkerData, HeatmapPoint } from "../providers/types";
import { getCurrencySymbol } from "../utils";

export interface HotelFeature {
  /**
   * Load hotels for a place and display them on the map
   */
  loadHotels(params: FetchHotelsParams): Promise<void>;

  /**
   * Get currently displayed hotels
   */
  getHotels(): Hotel[];

  /**
   * Toggle the visibility of the heatmap layer. When `visible` is omitted,
   * the visibility will be toggled.
   */
  toggleHeatmap(visible?: boolean): void;

  /**
   * Returns whether the heatmap layer is currently visible.
   */
  isHeatmapVisible(): boolean;
}

const HOTEL_HEATMAP_SOURCE_ID = "hotel-heatmap-source";
const HOTEL_HEATMAP_LAYER_ID = "hotel-heatmap-layer";

// Hotel heatmap styling - blue (low prices) to red (high prices)
const HOTEL_HEATMAP_PAINT = {
  "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
  "heatmap-color": [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(33,102,172,0)",
    0.2,
    "rgb(103,169,207)",
    0.4,
    "rgb(209,229,240)",
    0.6,
    "rgb(253,219,199)",
    0.8,
    "rgb(239,138,98)",
    1,
    "rgb(178,24,43)",
  ],
  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
  "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0.6],
};

export const hotelFeature = (
  provider: MapProvider,
  state: State
): HotelFeature => {
  let latestHeatmapPoints: HeatmapPoint[] = [];
  let heatmapVisible = false;

  const updateHeatmap = (points: HeatmapPoint[]) => {
    latestHeatmapPoints = points;

    provider.renderHeatmap({
      points: latestHeatmapPoints,
      sourceId: HOTEL_HEATMAP_SOURCE_ID,
      layerId: HOTEL_HEATMAP_LAYER_ID,
      paint: HOTEL_HEATMAP_PAINT,
    });
    syncLayers();
  };

  const syncLayers = () => {
    const hasData = latestHeatmapPoints.length > 0;

    if (!hasData) {
      heatmapVisible = false;
    }

    const showHeatmap = heatmapVisible && hasData;

    provider.setHeatmapVisibility({
      visible: showHeatmap,
      layerId: HOTEL_HEATMAP_LAYER_ID,
    });
    provider.setMarkersVisibility(!showHeatmap);
  };

  return {
    async loadHotels(params: FetchHotelsParams) {
      // Fetch hotels
      const hotelData = await fetchPlaceHotels(params);

      // Auto-display: set viewport and show markers
      provider.setViewport(hotelData.viewport);
      state.currentHotels = hotelData.hotels;

      const hotelMarkers = hotelData.hotels.map((hotel) => {
        const el = document.createElement("a");
        el.className = "custom-marker";
        el.innerHTML = `${hotel.price} ${getCurrencySymbol(hotel.currency)}`;
        el.href = hotel.deepLink;
        el.target = "_blank";
        el.title = hotel.name;

        return {
          element: el,
          lnglat: [hotel.longitude, hotel.latitude],
          type: "Hotel",
        } as MarkerData;
      });

      provider.renderMarkers(hotelMarkers);
      updateHeatmap(
        hotelData.hotels.map((hotel) => ({
          lnglat: [hotel.longitude, hotel.latitude],
          weight: hotel.price,
        }))
      );
    },

    getHotels() {
      return [...state.currentHotels];
    },

    toggleHeatmap(visible?: boolean) {
      if (typeof visible === "boolean") {
        heatmapVisible = visible;
      } else {
        heatmapVisible = !heatmapVisible;
      }

      syncLayers();
    },

    isHeatmapVisible() {
      return heatmapVisible && latestHeatmapPoints.length > 0;
    },
  };
};
