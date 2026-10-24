/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\runtime-browser-setup.ts
 * @Description: 在创建浏览器之前阻止 macOS seatbelt 内的独立浏览器启动
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 受限环境必须由执行工具批准具体命令；不清除或伪造环境标记。 */
export default function assertBrowserLaunchEnvironment(): void {
  if (
    process.platform === 'darwin' &&
    process.env.CODEX_SANDBOX === 'seatbelt'
  ) {
    throw new Error(
      '当前是 macOS Codex seatbelt 沙箱，不能启动独立浏览器。请将 bunx playwright test --config playwright.runtime.config.ts 作为具体命令交给执行工具，以 sandbox_permissions=require_escalated 获批后执行；不要删除 CODEX_SANDBOX 或使用 --no-sandbox 绕过。'
    )
  }
}
