/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-20
 * @FilePath: \Robot_Admin\src\utils\d_authFeedback.ts
 * @Description: 登录和退出提示的统一文案，仅在完整会话转换后展示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
interface AuthFeedback {
  title: string
  content: string
  meta: string
  duration: number
  keepAliveOnHover: boolean
}

const greetings = [
  { before: 6, title: '夜深了', wish: '忙完手头的事，记得早点休息。' },
  {
    before: 12,
    title: '早上好',
    wish: '新的一天，愿你工作顺利，也有一份好心情。',
  },
  { before: 14, title: '中午好', wish: '忙碌之余，记得好好吃饭、稍作休息。' },
  {
    before: 18,
    title: '下午好',
    wish: '愿接下来的工作从容有序，忙碌之余也记得休息。',
  },
  {
    before: 22,
    title: '晚上好',
    wish: '辛苦了，处理完手头的事，留些时间给自己。',
  },
  { before: 24, title: '夜深了', wish: '忙完手头的事，记得早点休息。' },
] as const

/** 按本机时间问候；公司名称来自最终激活的会话，而非待选择的公司。 */
export const createLoginFeedback = (
  displayName: string,
  companyName = '',
  now = new Date()
): AuthFeedback => {
  const greeting =
    greetings.find(item => now.getHours() < item.before) ?? greetings[0]
  return {
    title: `${greeting.title}，${displayName.trim() || '朋友'}`,
    content: companyName
      ? `欢迎回来，已进入「${companyName}」。`
      : '欢迎回来，工作台已为你准备就绪。',
    meta: greeting.wish,
    duration: 5200,
    keepAliveOnHover: true,
  }
}

/** 主动退出保留简短告别，过期退出明确引导重新登录。 */
export const createLogoutFeedback = (
  displayName: string,
  isExpired = false
): AuthFeedback => ({
  title: isExpired ? '登录已到期' : '已退出登录',
  content: isExpired
    ? '请重新登录后继续工作。'
    : `${displayName.trim() || '你'}，辛苦了。愿接下来的时光轻松愉快。`,
  meta: isExpired ? '为保护账号，请重新验证身份。' : '期待下次见面。',
  duration: 4500,
  keepAliveOnHover: true,
})
