/*
 * @Description: 联邦共享层 — 公共常量
 * Host (robotAdmin) 和所有应用共享的常量注册表
 * 无论在 Monorepo 还是独立仓库模式下，此文件都是 Single Source of Truth
 */

/** 联邦应用名称注册表 */
export const MF_APP_NAMES = {
  HOST: 'robotAdmin',
  LOGISTICS: 'logistics',
} as const

/** robotAdmin 暴露的远程模块路径 */
export const MF_EXPOSED_MODULES = {
  Table: './Table',
  Form: './Form',
  Tree: './Tree',
  Icon: './Icon',
  Editor: './Editor',
} as const

/** 各应用默认开发端口 */
export const MF_DEV_PORTS = {
  robotAdmin: 1988,
  logistics: 2001,
} as const
