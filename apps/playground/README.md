# LiteAPI Map Playground

The playground is a Vite app that exercises the LiteAPI Map SDK against the local BFF. It renders multiple map instances, showcases the auto-load and manual loading patterns, and demonstrates the optional weather overlay so you can verify the full integration in a browser.

## Prerequisites

- Node.js 18 or newer.
- The LiteAPI BFF running locally or deployed somewhere accessible (see `../bff`).
- A `.env` file with the proxy URL the browser should call. Use the provided template:

```bash
cd apps/playground
cp .env .env.local   # optionally keep local overrides
```

Update the chosen env file to point at your BFF:

```
VITE_PROXY_BASE_URL=http://localhost:3000
```

## Install & run

```bash
# from apps/playground
yarn install         # or npm install

yarn dev             # starts Vite on http://localhost:5173
```

Additional scripts:

- `yarn build` – type-checks with `tsc` then emits a production build to `dist/`.
- `yarn preview` – serves the built output (useful for verifying the bundle).

Make sure the BFF is running before loading the playground; otherwise hotel and weather requests will fail.

## Project layout

```
apps/playground
├── index.html         # Single-page shell with three map containers
├── src/
│   ├── main.ts        # Playground orchestration (map init, logging, weather)
│   └── style.css      # Lightweight styling for the demo layout
└── README.md          # This file
```

## What the demo does

`src/main.ts` bootstraps three instances of the SDK:

1. Paris (`#map-paris`) auto-loads hotels during initialisation.
2. Dubai (`#map-dubai`) initialises an empty map and then calls `loadHotels`.
3. New York (`#map-newyork`) auto-loads again to contrast both patterns.

All three share helper utilities that calculate tomorrow’s dates and build the request payload sent to the BFF. After the maps load, the script logs hotel counts to the console and exposes each map under `window.maps` for quick experimentation:

```js
maps.paris.toggleHeatmap(true);
maps.dubai.getHotels();
maps.newyork.setZoom(10);
```

A timed callback also demonstrates `loadWeather` + `toggleWeatherLayer` for the first map.

## Customising the demo

- **Change locations:** edit the place IDs passed to `createHotelQuery` in `src/main.ts`.
- **Adjust pricing scenarios:** modify currencies, guest nationalities, or occupancies in the same helper.
- **Weather test:** ensure `OPENWEATHER_API_KEY` is configured in the BFF, then keep or remove the weather timeout block.
- **Styling:** update `src/style.css` if you want to tweak layout or marker appearance (the SDK injects its own control styling; this file covers framing).

During `yarn dev` the Vite config aliases `liteapi-map-core-sdk` to the local source (`packages/core/src/index.ts`) for instant feedback. Production builds fall back to the version installed from npm. Remember to keep the playground’s dependency on the local package up to date if you iterate on the core SDK (`yarn build` in `packages/core`, then restart the playground).

## Troubleshooting

- **Blank screen / network errors:** check the browser console. Missing or incorrect `VITE_PROXY_BASE_URL` is the most common cause.
- **No hotels returned:** ensure the BFF logs show successful LiteAPI responses for the chosen place and dates. Some combinations legitimately have zero availability.
- **Weather errors:** verify the BFF has an OpenWeatherMap key and that the browser can reach `/api/weather`.
- **Type errors during build:** run `yarn install` at the repo root to ensure workspace dependencies are linked correctly.

The playground is intentionally minimal; treat it as a living sample for developers, QA, and demos. Update it alongside SDK changes to keep the end-to-end flow representative.
