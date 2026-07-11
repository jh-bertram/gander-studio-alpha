import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: [
    '**/tests/e2e/**/*.spec.ts',
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
