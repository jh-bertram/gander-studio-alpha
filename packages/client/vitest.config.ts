import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Mirrors vite.config.ts's resolve.alias — needed because any test that transitively imports a
  // components/ui/* file (which uses the '@/...' alias) fails module resolution under vitest
  // without it. Non-behavioral: only affects test-time module resolution, matches the tsconfig
  // `paths` mapping already in effect for the app build.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'src/tests/**'],
  },
});
