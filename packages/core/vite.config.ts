import { defineConfig } from 'vite';
import { resolve } from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LiteAPIMapSDK',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['mapbox-gl'],
      output: {
        exports: 'named',
        globals: {
          'mapbox-gl': 'mapboxgl',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
