/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\utils\d_notificationHtml.ts
 * @Description: 消息正文仅保留排版语义，链接和附件由受控业务入口处理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import DOMPurify from 'dompurify'

/** 保留正文排版，禁止脚本、宿主样式、表单、外链和远程资源。 */
export function sanitizeNotificationHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'hr',
      'span',
    ],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
}
