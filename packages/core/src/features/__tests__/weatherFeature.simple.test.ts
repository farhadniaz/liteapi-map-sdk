import { describe, it, expect } from "@jest/globals";
import { WeatherControl, weatherFeature } from "../weatherFeature";
import type { MapProvider } from "../../providers/types";

describe("WeatherControl", () => {
  it("should create container element", () => {
    const control = new WeatherControl();
    const container = control.onAdd();
    expect(container).toBeInstanceOf(HTMLDivElement);
  });

  it("should update display with weather data", () => {
    const control = new WeatherControl();
    const container = control.onAdd();

    control.setWeather({
      latitude: 48,
      longitude: 2,
      temperature: 20,
      feelsLike: 18,
      description: "clear",
      icon: "01d",
      humidity: 60,
      windSpeed: 5,
    });

    expect(container.innerHTML).toContain("20°C");
  });

  it("should show and hide container", () => {
    const control = new WeatherControl();
    const container = control.onAdd();

    control.show();
    expect((container as HTMLElement).style.display).toBe("block");

    control.hide();
    expect((container as HTMLElement).style.display).toBe("none");
  });
});

describe("weatherFeature", () => {
  const mockProvider = {
    getViewport: () => ({
      south: 0,
      west: 0,
      north: 0,
      east: 0,
      low: { latitude: 0, longitude: 0 },
      high: { latitude: 0, longitude: 0 },
    }),
    addControl: () => {},
    onViewportChange: () => {},
  } as any as MapProvider;

  it("should track visibility state", () => {
    const feature = weatherFeature(mockProvider);

    expect(feature.isWeatherLayerVisible()).toBe(false);

    feature.toggleWeatherLayer(true);
    expect(feature.isWeatherLayerVisible()).toBe(true);
  });
});
