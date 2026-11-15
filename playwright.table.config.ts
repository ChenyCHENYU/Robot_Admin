/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-15
 * @FilePath: \Robot_Admin\playwright.table.config.ts
 * @Description: 正式产物上的三浏览器复合表格业务链与账号/公司偏好隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineConfig, devices } from '@playwright/test'

const viewport = { width: 1720, height: 1200 }
const baseURL = 'http://127.0.0.1:4188'

export default defineConfig({
  globalSetup: './e2e/runtime-browser-setup.ts',
  testDir: './e2e',
  testMatch: ['table-composite.pw.ts', 'table-preference-isolation.pw.ts'],
  forbidOnly: true,
  failOnFlakyTests: true,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  outputDir: 'node_modules/.cache/table-regression',
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: 'node_modules/.cache/table-regression-results.json' },
    ],
  ],
  use: { baseURL, viewport, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport,
        launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] },
      },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport } },
  ],
  webServer: {
    command:
      'bunx vite preview --configLoader native --host 127.0.0.1 --port 4188 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
