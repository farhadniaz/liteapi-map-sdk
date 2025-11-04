import mapboxgl, { type ControlPosition, type IControl } from "mapbox-gl";
import type { FeatureCollection, Point } from "geojson";
import type {
  MapProvider,
  MapProviderConfig,
  MarkerData,
  HeatmapData,
  HeatmapVisibility,
} from "./types";
import type { Viewport } from "../types";

export class MapboxProvider implements MapProvider {
  private map: mapboxgl.Map | null = null;
  private markers: mapboxgl.Marker[] = [];

  private viewportChangeCallback: ((viewport: Viewport) => void) | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async initialize(config: MapProviderConfig): Promise<void> {
    if (!config.accessToken) {
      throw new Error("Access token is required");
    }

    // Handle selector - remove leading '#' if present since Mapbox expects just the ID
    const containerId = config.selector.startsWith("#")
      ? config.selector.slice(1)
      : config.selector;

    this.map = new mapboxgl.Map({
      accessToken: config.accessToken,
      container: containerId,
      style: config.style || "mapbox://styles/mapbox/streets-v12",
      center: config.center || [0, 0],
      zoom: config.zoom || 8,
    });

    this.map.addControl(new mapboxgl.NavigationControl(), "top-right");
    this.map.addControl(new mapboxgl.GeolocateControl(), "top-right");

    // Wait for the map to fully load before resolving
    return new Promise((resolve) => {
      this.map!.on("load", () => {
        resolve();
      });
    });
  }
  addControl(control: IControl, position?: ControlPosition) {
    this.map?.addControl(control, position);
  }
  setCenter(lng: number, lat: number): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    this.map.setCenter({ lng, lat });
  }

  setZoom(zoom: number): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    this.map.setZoom(zoom);
  }

  resize(): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    // Force the map to resize to fit its container
    this.map.resize();
  }

  getViewport(): Viewport {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    const bounds = this.map.getBounds();
    if (!bounds) {
      throw new Error("Map bounds not available");
    }

    return {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
      low: {
        latitude: bounds.getSouth(),
        longitude: bounds.getWest(),
      },
      high: {
        latitude: bounds.getNorth(),
        longitude: bounds.getEast(),
      },
    };
  }

  setViewport(viewport: Viewport): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    // Use BOTH low (southwest) and high (northeast) to create bounding box
    // This ensures ALL hotels are visible on the map
    const southwest: [number, number] = [
      viewport.low.longitude,
      viewport.low.latitude,
    ];
    const northeast: [number, number] = [
      viewport.high.longitude,
      viewport.high.latitude,
    ];
    this.map.fitBounds([southwest, northeast], {
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      maxZoom: 15, // Don't zoom in too much for single hotels
      duration: 500, // Smooth animation (0.5 seconds)
    });
  }

  onViewportChange(callback: (viewport: Viewport) => void): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    this.viewportChangeCallback = callback;

    // Listen to map movement events (drag, zoom, etc.)
    this.map.on("moveend", () => {
      // Debounce to avoid excessive calls
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        if (this.viewportChangeCallback) {
          const viewport = this.getViewport();
          this.viewportChangeCallback(viewport);
        }
      }, 1000); // Wait 1 second after user stops moving the map
    });
  }

  renderMarkers(markersData: MarkerData[], clearFirst: boolean = false): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }
    if (clearFirst) {
      this.clearMarkers();
    }

    const markers = markersData.map(({ element, lnglat }) => {
      const marker = new mapboxgl.Marker({ element })
        .setLngLat(lnglat)
        .addTo(this.map!);
      return marker;
    });

    this.markers = [...this.markers, ...markers];
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  setMarkersVisibility(visible: boolean): void {
    const display = visible ? "" : "none";
    this.markers.forEach((marker) => {
      const element = marker.getElement();
      if (element) {
        element.style.display = display;
      }
    });
  }

  renderHeatmap({ points, sourceId, layerId, paint }: HeatmapData): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    const geojson: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: point.lnglat,
        },
        properties: {
          weight: point.weight ?? 1,
        },
      })),
    };

    const existingSource = this.map.getSource(sourceId) as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (existingSource) {
      existingSource.setData(geojson);
    } else {
      // Default paint style if not provided
      const defaultPaint = {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "weight"],
          0,
          0,
          1,
          1,
        ],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0,0,255,0)",
          0.5,
          "rgb(0,255,0)",
          1,
          "rgb(255,0,0)",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0.6],
      };

      this.map.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      this.map.addLayer({
        id: layerId,
        type: "heatmap",
        source: sourceId,
        layout: {
          visibility: "none",
        },
        paint: paint || defaultPaint,
      });
    }
  }

  setHeatmapVisibility({ visible, layerId }: HeatmapVisibility): void {
    if (!this.map) {
      throw new Error("Map not initialized");
    }

    if (this.map.getLayer(layerId)) {
      this.map.setLayoutProperty(
        layerId,
        "visibility",
        visible ? "visible" : "none"
      );
    }
  }

  destroy(): void {
    this.clearMarkers();

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.viewportChangeCallback = null;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
