# LiteAPI Map BFF

This service is the gateway the SDK uses to talk to LiteAPI safely. It hides API keys, stitches together multiple LiteAPI endpoints, and exposes a compact set of endpoints designed for map UIs.

## Highlights

- Proxies LiteAPI requests so keys never reach the browser.
- Fetches place metadata, hotel availability, and rates in a single roundtrip.
- Normalises pricing, filters out unavailable hotels, and generates whitelabel deeplinks.
- Provides a weather endpoint that fronts OpenWeatherMap for the current viewport.

## Prerequisites

- Node.js 18 or later (built-in `fetch` support).
- A LiteAPI account with an API key and base URL.
- Optional: an OpenWeatherMap API key if you plan to enable weather overlays in the SDK.

The server reads configuration from environment variables. Start with the template in `example.env`:

```bash
cp example.env .env
```

Then edit `.env` with real credentials:

```
LITEAPI_KEY=sk_live_***
LITEAPI_BASE=https://api.liteapi.travel/v3.0
OPENWEATHER_API_KEY=owm_***           # Optional, needed for /api/weather
PORT=3000
```

`LITEAPI_BASE` should point at the LiteAPI REST root (without trailing slash). The server throws during boot if required values are missing.

## Installation

From `apps/bff/` install dependencies:

```bash
yarn install
# or
npm install
```

## Running the server

- `npm run dev` – starts the TypeScript source with live reload (`tsx watch`).
- `npm run build && npm start` – compiles to `dist/` and runs the production server.

The application defaults to `http://localhost:8080` unless `PORT` is set.

## HTTP API

### `POST /api/map/places/:placeId/hotels`

Combines LiteAPI place, hotel, and rate data into the format consumed by the core SDK.

**Request**

```jsonc
{
  "checkin": "2025-04-18",
  "checkout": "2025-04-19",
  "currency": "EUR",
  "language": "en",
  "occupancies": [
    { "adults": 2, "children": [] }
  ],
  "adults": 2,          // optional, used for deeplink generation
  "rooms": 1            // optional, used for deeplink generation
}
```

`occupancies` is forwarded directly to LiteAPI. If you omit it, the service falls back to the `adults` / `rooms` numbers when building deeplinks but the rates request still requires a non-empty array.

**Success response**

```jsonc
{
  "viewport": {
    "south": 48.8156,
    "west": 2.2241,
    "north": 48.9021,
    "east": 2.4699,
    "low": { "latitude": 48.8156, "longitude": 2.2241 },
    "high": { "latitude": 48.9021, "longitude": 2.4699 }
  },
  "hotels": [
    {
      "hotelId": "lp72e2c",
      "name": "Sample Hotel",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "price": 189.42,
      "currency": "EUR",
      "hasAvailability": true,
      "deepLink": "https://whitelabel.nuitee.link/…"
    }
  ]
}
```

- Coordinates are distributed randomly within ~8km of the place centroid if LiteAPI only returns a single location point.
- Prices are selected using the first non-null of `offerRetailRate`, `suggestedSellingPrice`, `rates[0].retailRate.suggestedSellingPrice[0]`, or `rates[0].retailRate.total[0]`.
- Hotels without a usable price are filtered out before returning the payload.

**Errors**

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| 400    | Validation failed (missing body/params)         |
| 500    | LiteAPI or internal error when composing data   |

LiteAPI error responses are surfaced as `500` with the upstream message.

### `GET /api/weather`

Wraps OpenWeatherMap to provide weather data for the current viewport centre.

**Query parameters**

| Name | Required | Notes                  |
| ---- | -------- | ---------------------- |
| `lat` | ✅       | Latitude in decimal degrees |
| `lon` | ✅       | Longitude in decimal degrees |

Requires `OPENWEATHER_API_KEY` in the environment. If the key is missing, the server responds with `500`.

**Sample response**

```jsonc
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "temperature": 12.4,
  "feelsLike": 11.8,
  "description": "light rain",
  "icon": "10d",
  "humidity": 78,
  "windSpeed": 5.2,
  "city": "Paris"
}
```

## Working with the core SDK

- Point `proxyBaseURL` in the SDK config to wherever this server is running (e.g. `http://localhost:3000`).
- Keep latency low by running the BFF near the frontend; the server makes sequential LiteAPI requests today.
- CORS is open by default (`cors()` middleware with no origin restrictions). Lock it down before production deployment.

## Troubleshooting

- **Server exits immediately:** check for missing `LITEAPI_BASE` or `LITEAPI_KEY`; the service validates them on startup.
- **Hotel response empty:** verify the chosen `placeId` has available rates for the requested dates. Inspect LiteAPI traffic with temporary logging if needed.
- **Weather endpoint returns 500:** confirm `OPENWEATHER_API_KEY` is in `.env` and valid.
- **Pricing looks off:** adjust the price selection strategy in `src/server.ts` (the priority list is near the top of the request handler).

## Next steps

- Create automated tests around rate selection and deeplink helpers before expanding functionality.
- Consider caching LiteAPI responses or adding retries if you expect high traffic.
