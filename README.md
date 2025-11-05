# LiteAPI Map SDK

[![npm version](https://img.shields.io/npm/v/liteapi-map-core-sdk.svg)](https://www.npmjs.com/package/liteapi-map-core-sdk)

**A JavaScript SDK for embedding interactive hotel maps with real-time pricing and heatmap visualizations.**

## Features

- 🗺️ Interactive hotel maps with price markers
- 🔥 Heatmap visualization for price density
- 🌦️ Real-time weather Map tool overlay
- 🔒 Secure API key management via BFF proxy
- 📦 TypeScript support with full type definitions
- 🎨 Provider-agnostic architecture

## Quick Start

Install the SDK:

```bash
npm install liteapi-map-core-sdk
# or
yarn add liteapi-map-core-sdk
```

Basic usage:

```typescript
import LiteAPI from "liteapi-map-core-sdk";

const map = await LiteAPI.Map.init({
  selector: "#map",
  hotelsQuery: {
    placeId: "ChIJOwg_06VPwokRYv534QaPC8g",
    checkin: "2025-03-18",
    checkout: "2025-03-19",
    occupancies: [{ adults: 2, children: [] }],
    currency: "USD",
    guestNationality: "US",
    proxyBaseURL: "http://localhost:3000", // bff-proxy URL
  },
});

// Toggle heatmap view
map.toggleHeatmap(true);

// Load hotels manually
await map.loadHotels(query);

// Weather on map
await map.loadWeather(PROXY_BASE_URL);
map.toggleWeatherLayer(true);
```

## **[📖 Full Documentation & API Reference →](./packages/core/README.md)**

## LiteAPI Map SDK Monorepo

This repository hosts a developer toolkit for rendering LiteAPI hotel data on interactive maps. It includes the core browser SDK, a secure backend-for-frontend (BFF) service, and a playground app that demonstrates the full experience in the browser.

## At a Glance

- **Core SDK (`packages/core/`)** – Provider-agnostic mapping SDK that loads hotels, prices, heatmaps, and optional weather overlays.
- **BFF (`apps/bff/`)** – Node service that shields LiteAPI credentials, composes hotel data, and fronts the weather API.
- **Playground (`apps/playground/`)** – Vite demo that wires the SDK to the BFF for end-to-end testing and demos.

Each package ships with its own developer-focused documentation:

- [packages/core/README.md](./packages/core/README.md)
- [apps/bff/README.md](./apps/bff/README.md)
- [apps/playground/README.md](./apps/playground/README.md)

Start with those files when working inside a specific project.

## Getting Started

1. Install dependencies from the repo root:

   ```bash
   yarn install
   # or
   npm install
   ```

2. Follow the setup guides in the individual READMEs to run:
   - the BFF (configure LiteAPI and optional weather keys),
   - the playground (linked to the core package during development), and
   - the core package (build/test when making SDK changes).

**Note:** During `yarn dev` the playground consumes the core package source directly, so edits in `packages/core` are picked up without extra steps.
The workspace uses Node.js 18+ and modern ES module tooling across all packages.

## Repository Layout

```plaintext
.
├── packages/
│   └── core/          # SDK source, build outputs, and tests
└── apps/
    ├── bff/           # Backend-for-frontend server
    └── playground/    # Browser demo that consumes the SDK
```

Refer to the dedicated READMEs for detailed commands, environment variables, and integration notes.

---

## Links

- 📦 [NPM Package](https://www.npmjs.com/package/liteapi-map-core-sdk)
- 📖 [Core SDK Documentation](./packages/core/README.md)
- 🐛 [Report Issues](https://github.com/YOUR_USERNAME/lite-api-map/issues)
- 🌐 [LiteAPI Documentation](https://docs.liteapi.travel)
