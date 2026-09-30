/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\src\utils\d_externalLink.ts
 * @Description: 动态菜单外链的协议与来源校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

const isSupportedCandidate = (candidate: string): boolean =>
  !candidate.startsWith('//') &&
  !candidate.includes('\\') &&
  (candidate.startsWith('/') || /^https?:\/\//i.test(candidate))

const isAllowedUrl = (
  candidate: string,
  url: URL,
  currentOrigin: string
): boolean => {
  const sameOrigin = url.origin === currentOrigin
  if (candidate.startsWith('/') && !sameOrigin) return false
  if (!sameOrigin && url.protocol !== 'https:') return false
  return !url.username && !url.password
}

/** 只允许 HTTPS 外链及当前站点路径，拒绝可执行协议和带凭据 URL。 */
export function resolveExternalLink(
  value: unknown,
  currentOrigin: string
): string | null {
  if (typeof value !== 'string') return null

  const candidate = value.trim()
  if (!candidate || !isSupportedCandidate(candidate)) return null

  try {
    const url = new URL(candidate, currentOrigin)
    return isAllowedUrl(candidate, url, currentOrigin) ? url.href : null
  } catch {
    return null
  }
}
