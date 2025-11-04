# LiteAPI Map SDK - Core

LiteAPI Map SDK core exposes the developer-facing API for embedding the LiteAPI hotel map inside web applications. It wraps the underlying map provider with hotel price markers, a heatmap overlay, weather widgets, and runtime controls so you can focus on the experience instead of map plumbing.

## Highlights

- Provider abstraction isolates mapping logic behind the `MapProvider` interface.
- Promise-based API that returns a single object combining hotel and weather features plus common map controls.
- Built-in helpers for loading LiteAPI hotel pricing data and weather for the current viewport via the BFF proxy.
- Works with multiple map instances on the same page and supports runtime configuration changes.

## Prerequisites

- Node.js 18 or newer and a bundler that understands ES modules (Vite, Webpack 5, Rollup).
- Credentials for the configured map provider. The repository currently ships with demo credentials wired in `src/index.ts`; update them with production values before shipping.
- The LiteAPI BFF proxy running locally or hosted. Setup instructions live in `../../apps/bff/README.md`.
- Google Place IDs for the locations you want to surface hotels for.

> Heads up: the SDK renders price markers using simple `<a class="custom-marker">` elements. Provide CSS in your host app to style them.

## Installation

Install the package (peer dependencies declared in `package.json` must also be satisfied):

```bash
npm install liteapi-map-sdk-core
# or
yarn add liteapi-map-sdk-core
```

## Quick start

1. Add a container to your page:

```html
<div id="map" style="width: 100%; height: 400px;"></div>
```

2. Initialize the SDK from your application code:

```ts
import LiteAPI from "liteapi-map-sdk-core";

const hotelsQuery = {
  placeId: "ChIJOwg_06VPwokRYv534QaPC8g", // New York
  checkin: "2025-03-18",
  checkout: "2025-03-19",
  occupancies: [{ adults: 2, children: [] }],
  currency: "USD",
  guestNationality: "US",
  proxyBaseURL: "http://localhost:3000",
};

const map = await LiteAPI.Map.init({
  selector: "#map",
  hotelsQuery,
  onLoad: (controls) => {
    console.log("Viewport:", controls.getViewport());
  },
});

console.log(`Loaded ${map.getHotels().length} hotels`);
```

### Manual loading pattern

If you prefer to control when data is fetched, initialise the map first and call `loadHotels` later:

```ts
const map = await LiteAPI.Map.init({
  selector: "#map",
  center: [-73.9857, 40.7484],
  zoom: 12,
});

await map.loadHotels({
  ...hotelsQuery,
  checkin: "2025-04-08",
  checkout: "2025-04-09",
});
```

### Weather overlay

```ts
await map.loadWeather("http://localhost:3000");
map.toggleWeatherLayer(true);

if (!map.isWeatherLayerVisible()) {
  console.warn("Weather layer hidden");
}
```

Toggle the hotel heatmap at runtime:

```ts
map.toggleHeatmap(); // toggles visibility
map.toggleHeatmap(true); // force it on
```

## API reference

### `LiteAPI.Map.init(options)`

```ts
export interface MapInitOptions {
  selector: string;
  style?: string;
  center?: [number, number];
  zoom?: number;
  onLoad?: (controls: HotelFeature & WeatherFeature & CommonMapControls) => void | Promise<void>;
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
```

- `selector` must point to the DOM element that should host the map (supports `#id` or raw id).
- `style`, `center`, and `zoom` mirror the fields exposed on `MapProviderConfig`.
- `onLoad` runs after the underlying map is ready and receives the full control object.
- `hotelsQuery` triggers an automatic hotel load once the map is initialised.

The returned promise resolves to the merged controls exported by the SDK:

```ts
type LiteAPIMap = HotelFeature & WeatherFeature & CommonMapControls;
```

**Hotel controls**

- `loadHotels(params)` loads hotels from the BFF and updates markers plus heatmap.
- `getHotels()` returns a copy of the currently rendered hotels.
- `toggleHeatmap(visible?)` switches between price markers and the heatmap visualisation.
- `isHeatmapVisible()` reports whether the heatmap layer is currently active.

**Weather controls**

- `loadWeather(proxyBaseURL)` fetches weather for the current viewport.
- `toggleWeatherLayer(visible)` shows or hides the weather widget control.
- `isWeatherLayerVisible()` reports the current weather widget state.

**Common map controls**

- `setCenter(lng, lat)` pans the map.
- `setZoom(zoom)` adjusts the zoom level.
- `resize()` forces the map to recalculate layout (trigger after container size changes).
- `getViewport()` returns the current bounding box.
- `destroy()` tears down the map instance and clears internal state.

## Data contracts

The SDK calls the LiteAPI BFF with the following payloads:

```ts
export interface FetchHotelsParams {
  placeId: string;
  checkin: string;
  checkout: string;
  occupancies: { adults: number; children?: number[] }[];
  currency: string;
  guestNationality: string;
  proxyBaseURL: string;
}
```

`fetchPlaceHotels` issues a `POST` request to:

```
POST {proxyBaseURL}/api/map/places/{placeId}/hotels
```

with the JSON body `{ checkin, checkout, occupancies, currency, guestNationality }`. The response must match:

```ts
export interface PlaceHotelsResponse {
  viewport: Viewport;
  hotels: {
    hotelId: string;
    name: string;
    latitude: number;
    longitude: number;
    price: number;
    currency: string;
    hasAvailability: boolean;
    deepLink: string;
  }[];
}
```

Weather data is loaded via:

```
GET {proxyBaseURL}/api/weather?lat={latitude}&lon={longitude}
```

and must return the `WeatherData` shape defined in `src/types.ts`.

## Development workflow

Run these commands from `packages/core` when working on the SDK itself:

```bash
# Install dependencies
yarn install

# Type-check and build the distributable bundle
yarn build

# Run Jest unit tests
yarn test
yarn test:watch
yarn test:coverage

# Serve the package in watch mode (Vite)
yarn dev
```

You can pair the SDK with the playground app at `../../apps/playground` to manually verify scenarios. The playground already consumes the published API surface.

## Publishing

Follow the checklist in `PUBLISHING.md` to run tests, build artifacts, and publish to npm. The package exposes CommonJS and ES module builds plus type definitions.

## Troubleshooting

- Provider credential errors usually indicate invalid or missing values. Update `packages/core/src/index.ts` before bundling.
- If hotel requests fail, confirm the BFF proxy is reachable and that Place IDs are whitelisted by LiteAPI.
- The heatmap toggles off when no pricing data is available; check the returned hotel list if the layer appears hidden unexpectedly.
- Ensure your host app ships CSS for `.custom-marker`, `.weather-widget`, and related styles used by the DOM elements inserted by the SDK.

## Additional resources

- Playground demo: `../../apps/playground`
- BFF proxy service: `../../apps/bff`
- Project-wide contribution guidelines: `../../README.md`
