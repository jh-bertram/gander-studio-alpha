import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/parsers/__tests__/**/*.test.ts'],
    pool: 'forks',
    environment: 'node',
  },
});
