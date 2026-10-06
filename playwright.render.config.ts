/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\playwright.render.config.ts
 * @Description: Chrome 与 Chromium 的真实像素绘制回归，复用已运行的服务
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineConfig } from '@playwright/test'

const baseURL =
  process.env.RENDER_BASE_URL ||
  (process.env.CI ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:1988')

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/render-integrity.pw.ts',
  workers: 1,
  reporter: 'list',
  timeout: 90_000,
  use: {
    baseURL,
    viewport: { width: 3437, height: 1190 },
    deviceScaleFactor: 1,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chrome', use: { channel: 'chrome' } },
    {
      name: 'chrome-retina',
      use: {
        channel: 'chrome',
        viewport: { width: 1720, height: 640 },
        deviceScaleFactor: 2,
      },
    },
    { name: 'chromium' },
    { name: 'chromium-retina', use: { deviceScaleFactor: 2 } },
  ],
  // CI 复用已构建的生产产物；本机检查继续使用用户已启动的服务。
  webServer: process.env.CI
    ? {
        command:
          'vite preview --configLoader native --host 127.0.0.1 --port 4173 --strictPort',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 30_000,
      }
    : undefined,
})
