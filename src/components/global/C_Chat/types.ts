/**
 * @Description: C_Chat 通用聊天组件 - 类型定义
 */

// ================= 消息类型 =================

/** 消息类型 */
export type MessageType = 'text' | 'image' | 'file' | 'system'

/** 消息发送方 */
export type MessageSender = 'self' | 'other' | 'system'

/** 消息状态 */
export type MessageStatus = 'sending' | 'sent' | 'failed'

/** 单条消息 */
export interface ChatMessage {
  /** 唯一标识 */
  id: string
  /** 消息内容（文本 / 图片 URL / 文件信息 JSON） */
  content: string
  /** 消息类型 */
  type: MessageType
  /** 发送方 */
  sender: MessageSender
  /** 发送时间（ISO 字符串 或 时间戳） */
  timestamp: string | number
  /** 发送者头像 URL */
  avatar?: string
  /** 发送者用户名 */
  username?: string
  /** 消息状态 */
  status?: MessageStatus
  /** 文件名（type = 'file' 时使用） */
  fileName?: string
  /** 文件大小（字节） */
  fileSize?: number
}

// ================= 联系人 =================

/** 联系人 / 会话 */
export interface ChatContact {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 头像 URL */
  avatar?: string
  /** 最后一条消息摘要 */
  lastMessage?: string
  /** 最后消息时间 */
  lastTime?: string | number
  /** 未读数 */
  unread?: number
  /** 是否在线 */
  online?: boolean
}

// ================= 组件 Props =================

export interface ChatProps {
  /** 联系人列表 */
  contacts?: ChatContact[]
  /** 消息列表 */
  messages?: ChatMessage[]
  /** 当前选中的联系人 ID */
  currentContactId?: string
  /** 输入框占位符 */
  placeholder?: string
  /** 是否显示联系人侧栏 */
  showContacts?: boolean
  /** 是否显示消息时间戳 */
  showTimestamp?: boolean
  /** 当前用户头像 */
  selfAvatar?: string
  /** 当前用户名 */
  selfName?: string
  /** 是否显示发送按钮 */
  showSendBtn?: boolean
  /** 是否正在加载历史消息 */
  loadingHistory?: boolean
  /** 标题（无联系人模式时显示） */
  title?: string
}

// ================= 默认值 =================

export const DEFAULT_CHAT_PROPS: Required<
  Pick<
    ChatProps,
    | 'placeholder'
    | 'showContacts'
    | 'showTimestamp'
    | 'showSendBtn'
    | 'loadingHistory'
    | 'title'
  >
> = {
  placeholder: '输入消息...',
  showContacts: true,
  showTimestamp: true,
  showSendBtn: true,
  loadingHistory: false,
  title: '聊天',
}
