import type { ControlPosition, IControl } from "mapbox-gl";
import type { Viewport } from "../types";

export interface MapProviderConfig {
  selector: string;
  accessToken: string;
  style?: string;
  center?: [number, number];
  zoom?: number;
}

export interface MarkerData {
  element: HTMLElement;
  lnglat: [number, number];
  type: "Hotel" | "Weather";
}

export interface HeatmapPoint {
  lnglat: [number, number];
  weight?: number;
}

export interface HeatmapIds {
  sourceId: string;
  layerId: string;
}

export interface HeatmapPaintStyle {
  "heatmap-weight"?: any;
  "heatmap-intensity"?: any;
  "heatmap-color"?: any;
  "heatmap-radius"?: any;
  "heatmap-opacity"?: any;
}

export interface HeatmapData extends HeatmapIds {
  points: HeatmapPoint[];
  paint?: HeatmapPaintStyle;
}
export interface HeatmapVisibility {
  visible: boolean;
  layerId: string;
}

/**
 * Map provider interface that all providers must implement
 */
export interface MapProvider {
  initialize(config: MapProviderConfig): Promise<void>;
  setCenter(lng: number, lat: number): void;
  setZoom(zoom: number): void;
  resize(): void;
  getViewport(): Viewport;
  setViewport(viewport: Viewport): void;
  onViewportChange(callback: (viewport: Viewport) => void): void;
  renderMarkers(markers: MarkerData[], clearFirst?: boolean): void;
  clearMarkers(): void;
  setMarkersVisibility(visible: boolean): void;
  destroy(): void;
  addControl(control: IControl, position?: ControlPosition): void;
  renderHeatmap(heatmapData: HeatmapData): void;
  setHeatmapVisibility(heatmapVisibility: HeatmapVisibility): void;
}
