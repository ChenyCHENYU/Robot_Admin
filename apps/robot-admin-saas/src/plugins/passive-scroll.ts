/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-25 22:51:06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-28 15:29:48
 * @FilePath: \Robot_Admin\src\plugins\passive-scroll.ts
 * @Description: 消除控制台滚动警告
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'

type Options = {
  eventTypes?: string[]
  debug?: boolean
}

const ALL_SCROLL_EVENTS = [
  'wheel',
  'mousewheel',
  'touchmove',
  'touchstart',
  'touchend',
]

export const PassiveScrollPlugin = {
  /**
   * * @description: 消除控制台滚动警告插件
   * ? @param {App} app Vue应用实例
   * ? @param {Options} options 可选参数，默认值为 { eventTypes: ['wheel','mousewheel'], debug: false }
   * ! @return {*}
   */
  install(app: App, options: Options = {}) {
    if (typeof window === 'undefined') return
    const { eventTypes = ALL_SCROLL_EVENTS, debug = false } = options
    const originalAdd = EventTarget.prototype.addEventListener

    /**
     * * @description: 添加事件监听器
     */
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (eventTypes.includes(type)) {
        if (typeof options === 'boolean') {
          options = { capture: options, passive: true }
        } else {
          options = { ...options, passive: true }
        }
        if (debug) {
          console.warn('[PassiveScroll] Applied to:', this, type)
        }
      }
      return originalAdd.call(this, type, listener, options)
    }
  },
}
