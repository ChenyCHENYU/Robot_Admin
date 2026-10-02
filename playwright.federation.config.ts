import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './federation/e2e',
  testMatch: '**/*.pw.ts',
  timeout: 90_000,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:2001',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        'vite preview --configLoader native --host 127.0.0.1 --port 1988 --strictPort',
      url: 'http://127.0.0.1:1988/federation/remoteEntry.js',
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
    },
    {
      command:
        'bun run --cwd sub-apps/logistics preview --host 127.0.0.1 --port 2001 --strictPort',
      url: 'http://127.0.0.1:2001',
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
    },
  ],
})
