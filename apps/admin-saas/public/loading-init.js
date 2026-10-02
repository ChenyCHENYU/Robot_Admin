/* 不使用内联事件处理器，确保加载动画在严格 CSP 下仍能淡入。 */
;(() => {
  const logo = document.querySelector('.app-loading-logo')
  if (!(logo instanceof HTMLImageElement)) return

  const reveal = () => logo.classList.add('loaded')
  if (logo.complete) reveal()
  else logo.addEventListener('load', reveal, { once: true })
})()
