import { defineConfig } from '@playwright/test'
import productionConfig from './playwright.config'

const baseURL = 'http://127.0.0.1:4175'

/** Run the same browser regressions against the sibling component source. */
export default defineConfig(productionConfig, {
  testIgnore: [],
  use: { baseURL },
  webServer: {
    command:
      'bun run dev:components --host 127.0.0.1 --port 4175 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
