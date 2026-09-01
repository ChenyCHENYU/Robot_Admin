/* 在应用样式加载前同步设置主题，避免首屏明暗闪烁。 */
;(() => {
  const mode = localStorage.getItem('theme-mode') || 'system'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)

  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  document.documentElement.style.background = isDark ? '#101014' : '#fff'
})()
