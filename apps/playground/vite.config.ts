import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    resolve: {
      alias: isDev
        ? {
            // In development: use local source code for hot reload and instant updates
            "liteapi-map-core-sdk": resolve(
              __dirname,
              "../../packages/core/src/index.ts"
            ),
          }
        : undefined, // In production use the package from node_modules
    },
  };
});
