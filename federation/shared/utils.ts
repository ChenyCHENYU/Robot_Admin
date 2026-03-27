/*
 * @Description: 联邦共享层 — 公共工具函数
 * 独立仓库模式下可通过 npm 包 @robot-admin/federation 引用
 */

/// <reference types="vite/client" />

/**
 * 构建远程模块 Entry URL
 * @param appName 远程应用名
 * @param port 开发端口号
 * @param filename remoteEntry 文件名
 */
export function buildRemoteEntry(
  appName: string,
  port: number,
  filename = 'remoteEntry.js'
): string {
  if (import.meta.env?.MODE === 'production') {
    // 生产环境从环境变量读取 CDN 地址
    return (
      import.meta.env?.[`VITE_MF_${appName.toUpperCase()}_URL`] ||
      `/${appName}/${filename}`
    )
  }
  return `http://localhost:${port}/${filename}`
}
