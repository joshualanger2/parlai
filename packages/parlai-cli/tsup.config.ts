import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  shims: true,
  splitting: false,
  sourcemap: true,
}); 