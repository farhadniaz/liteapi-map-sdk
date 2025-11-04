# LiteAPI Map SDK Monorepo

This repository hosts a developer toolkit for rendering LiteAPI hotel data on interactive maps. It includes the core browser SDK, a secure backend-for-frontend (BFF) service, and a playground app that demonstrates the full experience in the browser.

## At a Glance

- **Core SDK (`packages/core/`)** – Provider-agnostic mapping SDK that loads hotels, prices, heatmaps, and optional weather overlays.
- **BFF (`apps/bff/`)** – Node service that shields LiteAPI credentials, composes hotel data, and fronts the weather API.
- **Playground (`apps/playground/`)** – Vite demo that wires the SDK to the BFF for end-to-end testing and demos.

Each package ships with its own developer-focused documentation:

- `packages/core/README.md`
- `apps/bff/README.md`
- `apps/playground/README.md`

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

```
.
├── packages/
│   └── core/          # SDK source, build outputs, and tests
└── apps/
    ├── bff/           # Backend-for-frontend server
    └── playground/    # Browser demo that consumes the SDK
```

Refer to the dedicated READMEs for detailed commands, environment variables, and integration notes.
