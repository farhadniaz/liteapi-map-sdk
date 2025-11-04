import { fetchWeather } from "../api";
import type { WeatherData } from "../types";
import type { MapProvider } from "../providers/types";

export interface WeatherFeature {
  loadWeather(proxyBaseURL: string): Promise<void>;
  toggleWeatherLayer(visible: boolean): void;
  isWeatherLayerVisible(): boolean;
}

export class WeatherControl {
  private container: HTMLDivElement | null = null;
  private weatherData: WeatherData | null = null;

  onAdd(): HTMLElement {
    this.container = document.createElement("div");
    this.container.className =
      "mapboxgl-ctrl mapboxgl-ctrl-group weather-control";
    this.container.style.display = "none"; // Hidden by default
    this.updateDisplay();
    return this.container;
  }

  onRemove(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }

  setWeather(weather: WeatherData | null): void {
    this.weatherData = weather;
    this.updateDisplay();
  }

  show(): void {
    if (this.container) {
      this.container.style.display = "block";
    }
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = "none";
    }
  }

  private updateDisplay(): void {
    if (!this.container) return;

    if (this.weatherData) {
      this.container.innerHTML = `
        <div class="weather-widget">
          <img src="https://openweathermap.org/img/wn/${
            this.weatherData.icon
          }@2x.png"
               alt="${this.weatherData.description}"
               class="weather-icon" />
          <div class="weather-info">
            <div class="weather-temp">${Math.round(
              this.weatherData.temperature
            )}°C</div>
            <div class="weather-desc">${this.weatherData.description}</div>
            ${
              this.weatherData.city
                ? `<div class="weather-city">${this.weatherData.city}</div>`
                : ""
            }
          </div>
        </div>
      `;
    } else {
      this.container.innerHTML = '<div class="weather-widget">Loading...</div>';
    }
  }
}

export const weatherFeature = (provider: MapProvider): WeatherFeature => {
  let currentWeather: WeatherData | null = null;
  let weatherLayerVisible = false;
  let proxyBaseURL: string | null = null;
  let isAutoRefreshEnabled = false;
  const weatherControl = new WeatherControl();
  provider.addControl(weatherControl as any, "top-right");

  return {
    async loadWeather(proxyURL: string) {
      proxyBaseURL = proxyURL;

      const viewport = provider.getViewport();

      const centerLat = (viewport.low.latitude + viewport.high.latitude) / 2;
      const centerLon = (viewport.low.longitude + viewport.high.longitude) / 2;

      try {
        const weather = await fetchWeather({
          latitude: centerLat,
          longitude: centerLon,
          proxyBaseURL: proxyURL,
        });

        currentWeather = weather;

        // Re-render markers with weather data if layer is visible
        if (weatherLayerVisible) {
          this.toggleWeatherLayer(true);
        }

        // Set up auto-refresh on viewport change (only once)
        if (!isAutoRefreshEnabled && proxyBaseURL) {
          isAutoRefreshEnabled = true;
          provider.onViewportChange(async () => {
            if (weatherLayerVisible && proxyBaseURL) {
              try {
                await this.loadWeather(proxyBaseURL);
              } catch (error) {
                console.error(
                  "Failed to refresh weather on viewport change:",
                  error
                );
              }
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        throw error;
      }
    },

    toggleWeatherLayer(visible: boolean) {
      weatherLayerVisible = visible;

      const weather = visible && currentWeather ? currentWeather : undefined;

      if (weather) {
        weatherControl.setWeather(weather);
        weatherControl.show();
      } else {
        weatherControl.hide();
      }
    },

    isWeatherLayerVisible() {
      return weatherLayerVisible;
    },
  };
};
