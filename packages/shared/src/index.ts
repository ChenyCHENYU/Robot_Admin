// Robot Admin 共享工具包
// 阶段二将从 apps/admin 提取共享代码到这里

export const version = '1.0.0'

// 占位函数
export function log(message: string) {
  console.log(`[Robot Shared] ${message}`)
}

// 导出子模块（阶段二添加）
// export * from './utils'
// export * from './types'
// export * from './constants'
