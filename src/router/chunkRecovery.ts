/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\src\router\chunkRecovery.ts
 * @Description: 部署后动态模块失效的一次性刷新保护
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

interface RecoveryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const RECOVERY_KEY = 'robot-admin:chunk-recovery'
const RECOVERY_WINDOW_MS = 60_000

const isRecentClaim = (
  raw: string | null,
  url: string,
  now: number
): boolean => {
  if (!raw) return false
  try {
    const claim: unknown = JSON.parse(raw)
    return (
      typeof claim === 'object' &&
      claim !== null &&
      'url' in claim &&
      'at' in claim &&
      claim.url === url &&
      typeof claim.at === 'number' &&
      now >= claim.at &&
      now - claim.at < RECOVERY_WINDOW_MS
    )
  } catch {
    return false
  }
}

/** 同一地址在一分钟内最多自动刷新一次；存储不可用时交由用户手动重试。 */
export function claimChunkRecovery(
  storage: RecoveryStorage | undefined,
  url: string,
  now = Date.now()
): boolean {
  if (!storage) return false

  try {
    if (isRecentClaim(storage.getItem(RECOVERY_KEY), url, now)) return false

    storage.setItem(RECOVERY_KEY, JSON.stringify({ url, at: now }))
    return true
  } catch {
    return false
  }
}

/** 成功完成导航后，下次真正的版本更新可以重新自动恢复。 */
export function clearChunkRecovery(storage: RecoveryStorage | undefined): void {
  try {
    storage?.removeItem(RECOVERY_KEY)
  } catch {
    // 浏览器禁用存储时保持页面可用。
  }
}
