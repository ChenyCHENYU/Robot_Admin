/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:07:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-10-28
 * @FilePath: \Robot_Admin\src\plugins\loading.ts
 * @Description: 首屏加载动画控制 - 立即执行版（保持 index.html 干净）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * @description: 创建并立即显示首屏加载动画
 * @return {void}
 */
function createLoading(): void {
  // 避免重复创建
  if (document.querySelector('.app-loading')) {
    return
  }

  // 内联样式（关键CSS - 确保立即生效）
  const style = document.createElement('style')
  style.innerHTML = `
    .app-loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      z-index: 9999;
      transition: opacity 0.4s ease-out;
    }

    .app-loading-wrap {
      text-align: center;
      transform: translateY(-10%);
      width: 100%;
    }

    .app-loading-logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
    }

    .app-loading-logo {
      width: 280px;
      height: 280px;
      opacity: 0;
      /* ⭐ 快速平滑淡入：150ms，ease-out 更自然 */
      transition: opacity 0.15s ease-out;
    }

    .app-loading-logo.loaded {
      opacity: 1;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 0 auto 30px;
    }    .loading-dots span {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #1677ff;
      animation: pulse 1.4s infinite ease-in-out;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }

    .loading-dots span:nth-child(4) {
      animation-delay: 0.6s;
    }

    .app-loading-title {
      color: #1677ff;
      font-size: 1.6rem;
      font-weight: bold;
      letter-spacing: 1.5px;
      opacity: 0;
      animation: fadeIn 0.3s ease-out 0.1s forwards;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(0.8);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `

  // HTML 结构
  const loadingDiv = document.createElement('div')
  loadingDiv.className = 'app-loading'
  loadingDiv.innerHTML = `
    <div class="app-loading-wrap">
      <div class="app-loading-logo-container">
        <img
          src="/robot.gif"
          class="app-loading-logo"
          alt="Loading"
          onload="this.classList.add('loaded')"
        />
      </div>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h1 class="app-loading-title">Robot Admin</h1>
    </div>
  ` // 立即插入到 DOM
  document.head.appendChild(style)
  document.body.appendChild(loadingDiv)
}

/**
 * @description: 移除首屏加载动画
 * @param {number} delay - 延迟时间（毫秒），默认 200ms，让用户感知到加载完成
 * @return {void}
 */
export function removeLoading(delay = 200): void {
  const loading = document.querySelector('.app-loading') as HTMLElement | null

  if (!loading) {
    console.warn('加载动画元素未找到，可能已被移除')
    return
  }

  setTimeout(() => {
    // 添加淡出动画
    loading.style.opacity = '0'

    // 动画结束后移除元素
    setTimeout(() => {
      loading.remove()

      // 移除样式
      const style = document.querySelector('style')
      if (style && style.innerHTML.includes('.app-loading')) {
        style.remove()
      }

      console.log('✅ 首屏加载动画已移除')
    }, 400) // 等待 CSS transition 完成
  }, delay)
}

/**
 * @description: 立即移除加载动画（无延迟）
 * @return {void}
 */
export function removeLoadingImmediately(): void {
  removeLoading(0)
}

// ⭐ 关键：模块加载时立即执行，确保零延迟显示
createLoading()
