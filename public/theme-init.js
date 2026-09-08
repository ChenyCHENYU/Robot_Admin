/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\public\theme-init.js
 * @Description: 在应用样式加载前恢复主题，避免首屏明暗和设计风格闪烁
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

;(() => {
  const root = document.documentElement
  const validModes = new Set(['light', 'dark', 'system'])
  const validStyles = new Set([
    'glass-morphism',
    'corporate-minimal',
    'dark-tech',
  ])
  const readStoredValue = key => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }
  const readSystemIsDark = () => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  }
  const saveMode = mode => {
    try {
      window.localStorage.setItem('theme-mode', mode)
    } catch {
      // 首屏主题正确呈现优先于持久化成功。
    }
  }
  const savedMode = readStoredValue('theme-mode')
  const savedStyle = readStoredValue('robot-admin-design-style')
  let mode = validModes.has(savedMode) ? savedMode : 'system'
  const designStyle = validStyles.has(savedStyle)
    ? savedStyle
    : 'glass-morphism'
  const systemIsDark = readSystemIsDark()

  let isDark = mode === 'dark' || (mode === 'system' && systemIsDark)
  if (designStyle === 'dark-tech' && !isDark) {
    mode = 'dark'
    isDark = true
    saveMode(mode)
  }

  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  root.setAttribute('data-design-style', designStyle)
  root.style.backgroundColor = isDark ? '#1c1c1c' : '#ffffff'
})()
