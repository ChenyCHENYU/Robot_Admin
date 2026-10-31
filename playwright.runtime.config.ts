/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\playwright.runtime.config.ts
 * @Description: 三种真实浏览器的组件资源回归；Codex 下须由审批后的执行工具启动
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineConfig, devices } from '@playwright/test'

const viewport = { width: 1440, height: 960 }

export default defineConfig({
  globalSetup: './e2e/runtime-browser-setup.ts',
  testDir: './e2e',
  testMatch: 'runtime-*.pw.ts',
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: 'node_modules/.cache/runtime-regression-results.json' },
    ],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4176',
    viewport,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport } },
  ],
  webServer: {
    command:
      'bunx vite preview --config vite.runtime-regression.config.ts --host 127.0.0.1 --port 4176 --strictPort',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
