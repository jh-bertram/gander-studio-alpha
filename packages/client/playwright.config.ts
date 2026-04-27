import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Include both the e2e browser specs and the src/tests compose specs.
  // src/tests/compose includes both store-level unit tests (no page) and
  // browser tests (page.goto). All are valid playwright test files.
  testMatch: [
    '**/tests/e2e/**/*.spec.ts',
    '**/src/tests/compose/**/*.spec.ts',
  ],
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
