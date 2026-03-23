/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-23
 * @Description: 微前端通信常量 — 主子应用共享契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description: PostMessage 消息类型枚举
 * 主应用与子应用之间的所有通信消息类型，双方必须使用相同的常量
 */
export const MESSAGE_TYPES = {
  // ── 子 → 主：导航类 ──
  /** 子应用请求主应用跳转路由 */
  MICRO_APP_NAVIGATE: 'MICRO_APP_NAVIGATE',
  /** 子应用请求导航（非 iframe 模式） */
  NAVIGATE: 'NAVIGATE',
  /** 子应用路由变化通知 */
  ROUTE_CHANGE: 'ROUTE_CHANGE',

  // ── 子 → 主：通信类 ──
  /** 子应用发送自定义消息 */
  CUSTOM_MESSAGE: 'CUSTOM_MESSAGE',
  /** 子应用推送数据更新 */
  DATA_UPDATE: 'DATA_UPDATE',
  /** 子应用挂载完成 */
  MOUNTED: 'MOUNTED',

  // ── 主 → 子：确认回执 ──
  /** 自定义消息确认 */
  CUSTOM_MESSAGE_ACK: 'CUSTOM_MESSAGE_ACK',
  /** 数据更新确认 */
  DATA_UPDATE_ACK: 'DATA_UPDATE_ACK',

  // ── 主 → 子：数据推送 ──
  /** 主题变更通知 */
  THEME_CHANGE: 'THEME_CHANGE',
  /** 登出通知 */
  LOGOUT: 'LOGOUT',
} as const

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES]

/**
 * * @description: CustomEvent 事件名
 * 用于同一窗口内（主应用各组件之间）的事件通信
 */
export const CUSTOM_EVENTS = {
  /** 子应用数据更新事件（Portal 页面监听） */
  MICRO_APP_DATA_UPDATE: 'microAppDataUpdate',
  /** 主应用确认回执事件（子应用监听） */
  MAIN_APP_ACK: 'mainAppAck',
} as const

/**
 * * @description: SessionStorage 键名
 * 跨页面数据共享的存储键
 */
export const STORAGE_KEYS = {
  /** 子应用推送的数据缓存 */
  MICRO_APP_DATA: 'microAppData',
} as const
