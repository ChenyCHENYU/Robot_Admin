/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.attachments.ts
 * @Description: 消息附件通过统一鉴权客户端获取，不信任正文提供的任意下载地址
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { getData } from '@robot-admin/request-core/axios'

/** 后端校验当前会话对消息和附件的双重权限，返回二进制内容。 */
export async function downloadNotificationAttachment(
  messageId: string,
  attachmentId: string,
  signal?: AbortSignal
): Promise<Blob> {
  if (!messageId || !attachmentId)
    throw new Error('附件标识无效，请刷新消息详情')
  const body = await getData<Blob>(
    `/notifications/inbox/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}`,
    { signal, responseType: 'blob', silent: true, cache: false, dedupe: false }
  )
  if (!(body instanceof Blob) || body.type.includes('application/json')) {
    throw new Error('附件服务未返回有效文件，请稍后重试')
  }
  return body
}
