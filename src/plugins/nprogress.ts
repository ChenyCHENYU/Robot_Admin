/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-13 11:07:20
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 11:20:20
 * @FilePath: \Robot_Admin\src\plugins\nprogress.ts
 * @Description: NProgress 进度条配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 增强版自定义样式
const customStyle = `
  /* 进度条主体样式 */
  #nprogress .bar {
    background: linear-gradient(to right, #1677ff, #36cfc9);
    height: 3px;
  }

  /* 进度条闪光效果 */
  #nprogress .peg {
    box-shadow: 0 0 10px #1677ff, 0 0 5px #1677ff;
  }

  /* 加载圆圈样式 */
  #nprogress .spinner-icon {
    border-top-color: #1677ff;
    border-left-color: #1677ff;
  }
`

/**
 * @description: NProgress 进度条配置
 * @return {*} {NProgress}
 */
export function setupNProgress() {
  // 添加自定义样式
  const styleEl = document.createElement('style')
  styleEl.innerHTML = customStyle
  document.head.appendChild(styleEl)

  // 配置NProgress - 优化过渡速度，减少跳转延迟感
  NProgress.configure({
    showSpinner: false, // 禁用加载圆圈，减少视觉干扰
    easing: 'ease-out',
    speed: 200,
    trickleSpeed: 100,
    minimum: 0.15,
  })

  return NProgress
}
