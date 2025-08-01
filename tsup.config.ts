import { defineConfig } from 'tsup';
import { chmodSync } from 'fs';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'diagnostic-cli': 'src/diagnostic-cli.ts',
  },
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  outDir: 'build',
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: false,
  shims: false,
  external: [],
  noExternal: [],
  treeshake: true,
  minify: false,
  onSuccess: async () => {
    console.log('Setting executable permissions...');
    chmodSync('build/index.js', '755');
    chmodSync('build/diagnostic-cli.js', '755');
    console.log('Build complete!');
  },
  esbuildOptions(options) {
    // Set sourceRoot for Sentry
    options.sourceRoot = '/';
    options.sourcesContent = true;
  },
});