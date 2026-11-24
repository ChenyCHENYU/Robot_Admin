/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 聊天演示的本地附件与对象 URL
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ChatMessage } from '@robot-admin/naive-ui-components/C_Chat'

/** 仅为用户选中的本地文件生成预览，离开缓存会话时仍保留附件。 */
export function useChatAttachments(
  createId: () => string,
  append: (item: ChatMessage) => void
) {
  const message = useMessage()
  const entries = shallowReactive(
    new Map<string, { name: string; url: string }>()
  )
  const count = computed(() => entries.size)

  const add = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const input = event.target
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      message.warning('演示附件限 10 MB')
      return
    }

    const id = createId()
    const url = URL.createObjectURL(file)
    entries.set(id, { name: file.name, url })
    append({
      id,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      content: url,
      sender: 'self',
      timestamp: Date.now(),
      status: 'sent',
      fileName: file.name,
      fileSize: file.size,
    })
  }

  const download = (item: ChatMessage) => {
    const attachment = entries.get(item.id)
    if (!attachment) {
      message.info('附件已失效，请重新添加')
      return
    }
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    link.click()
  }

  onUnmounted(() => {
    for (const { url } of entries.values()) URL.revokeObjectURL(url)
    entries.clear()
  })

  return proxyRefs({ count, add, download })
}
