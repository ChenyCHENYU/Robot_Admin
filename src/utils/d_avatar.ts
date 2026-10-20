/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @Description: 可离线显示的人员头像，使用稳定配色并转义 SVG 文本
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
/** 姓名首字生成轻量矢量头像，不依赖外部图片服务。 */
export function createPersonAvatar(name: string, color?: string): string {
  const palette = ['#5879c8', '#518e83', '#9a73b6', '#ba8659', '#4e91a8']
  const hash = Array.from(name).reduce(
    (value, char) => value + (char.codePointAt(0) ?? 0),
    0
  )
  const fill = color ?? palette[hash % palette.length]
  const label = Array.from(name.trim())
    .slice(0, 2)
    .join('')
    .replace(
      /[&<>"']/g,
      char =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&apos;',
        })[char]!
    )
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="20" fill="${fill}"/><circle cx="58" cy="4" r="32" fill="white" opacity=".1"/><text x="32" y="39" text-anchor="middle" fill="white" font-family="sans-serif" font-size="22">${label || '?'}</text></svg>`)}`
}
