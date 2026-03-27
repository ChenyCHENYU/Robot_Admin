/*
 * @Description: 联邦集成层 — 统一入口
 *
 * federation/ 是所有 Module Federation 相关代码的集中管理层。
 * 无论项目采用 Monorepo（所有应用在一个仓库）还是 Multi-repo（各应用独立仓库），
 * 此目录都作为应用间通信、共享、集成的唯一契约层。
 *
 * Monorepo 模式：各应用通过相对路径引用
 *   import { MF_APP_NAMES } from '../../federation/shared'
 *
 * Multi-repo 模式：发布为 npm 包后引用
 *   import { MF_APP_NAMES } from '@robot-admin/federation'
 */

// Bridge — 应用级联邦通信
export * from './bridge'

// Shared — 跨应用共享常量、类型、工具
export * from './shared'
