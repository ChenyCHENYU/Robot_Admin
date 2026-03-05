# C_Chat 聊天组件

通用即时通讯聊天 UI 组件，支持联系人列表、消息气泡（文本/图片/文件/系统）、输入框。  
适用于 IM 即时通讯、客服系统、AI 对话等场景。

> 📖 在线文档：[https://www.tzagileteam.com/robot/components/chat](https://www.tzagileteam.com/robot/components/chat)

---

## 基本用法

```vue
<template>
  <C_Chat
    :contacts="contacts"
    :messages="messages"
    :current-contact-id="currentId"
    self-avatar="/avatar/me.png"
    self-name="CHENY"
    @send="handleSend"
    @select-contact="handleSelectContact"
  />
</template>
```

## AI 对话模式（无联系人侧栏）

```vue
<template>
  <C_Chat
    :messages="messages"
    :show-contacts="false"
    title="AI 助手"
    placeholder="问我任何问题..."
    self-name="User"
    @send="handleSend"
  />
</template>
```

---

## Props

| 属性             | 类型          | 默认值        | 说明                       |
| ---------------- | ------------- | ------------- | -------------------------- |
| contacts         | ChatContact[] | []            | 联系人列表                 |
| messages         | ChatMessage[] | []            | 消息列表                   |
| currentContactId | string        | ''            | 当前选中联系人 ID          |
| placeholder      | string        | '输入消息...' | 输入框占位符               |
| showContacts     | boolean       | true          | 是否显示联系人侧栏         |
| showTimestamp    | boolean       | true          | 是否显示消息时间戳         |
| selfAvatar       | string        | ''            | 当前用户头像 URL           |
| selfName         | string        | ''            | 当前用户名                 |
| showSendBtn      | boolean       | true          | 是否显示发送按钮           |
| loadingHistory   | boolean       | false         | 是否正在加载历史消息       |
| title            | string        | '聊天'        | 标题（无联系人模式时显示） |

## Events

| 事件名         | 参数               | 说明             |
| -------------- | ------------------ | ---------------- |
| send           | (content: string)  | 发送消息         |
| select-contact | (id: string)       | 选中联系人       |
| load-more      | —                  | 加载更多历史消息 |
| image-preview  | (url: string)      | 点击图片预览     |
| file-click     | (msg: ChatMessage) | 点击文件消息     |
| file-upload    | —                  | 点击上传文件     |
| emoji-click    | —                  | 点击表情按钮     |
| resend         | (msg: ChatMessage) | 重发失败消息     |

## Expose

| 方法           | 说明           |
| -------------- | -------------- |
| scrollToBottom | 滚动到最新消息 |

## Slots

| 插槽名        | 说明                 |
| ------------- | -------------------- |
| header        | 自定义顶栏内容       |
| input-actions | 自定义输入框左侧操作 |

## CSS 变量

| 变量                 | 默认值                    | 说明         |
| -------------------- | ------------------------- | ------------ |
| --chat-bg            | rgba(30, 30, 30, 1)       | 主背景色     |
| --chat-sidebar-bg    | rgba(25, 25, 25, 1)       | 侧栏背景色   |
| --chat-sidebar-width | 280px                     | 侧栏宽度     |
| --chat-header-bg     | rgba(35, 35, 35, 0.95)    | 顶栏背景色   |
| --chat-bubble-self   | rgba(24, 89, 233, 0.85)   | 自己消息气泡 |
| --chat-bubble-other  | rgba(55, 55, 55, 0.9)     | 对方消息气泡 |
| --chat-text-primary  | rgba(255, 255, 255, 0.92) | 主文字色     |
| --chat-avatar-size   | 36px                      | 头像尺寸     |
| --chat-radius        | 12px                      | 面板圆角     |

## 类型定义

```typescript
type MessageType = 'text' | 'image' | 'file' | 'system'
type MessageSender = 'self' | 'other' | 'system'
type MessageStatus = 'sending' | 'sent' | 'failed'

interface ChatMessage {
  id: string
  content: string
  type: MessageType
  sender: MessageSender
  timestamp: string | number
  avatar?: string
  username?: string
  status?: MessageStatus
  fileName?: string
  fileSize?: number
}

interface ChatContact {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastTime?: string | number
  unread?: number
  online?: boolean
}
```
