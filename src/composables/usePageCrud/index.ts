/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: usePageCrud 统一导出
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// ==================== 主函数 ====================
export { usePageCrud } from './usePageCrud'
// ==================== 适配器 ====================
export { toTableApis } from './tableAdapter'
// ==================== 全局配置 ====================
export {
  configureCrud,
  getGlobalConfig,
  resetGlobalConfig,
  applyPreset,
  CRUD_PRESETS,
  type PresetName,
} from './config'

// ==================== 类型 ====================
export type {
  // 基础类型
  HttpMethod,
  IdIn,
  IdsIn,
  MutationAction,
  // 函数类型
  ParamsSerializer,
  IdSerializer,
  ErrorHandler,
  // 配置类型
  EndpointOpt,
  ActionOpt,
  ApiEndpoints,
  BatchOperations,
  PageConfig,
  AutoRefreshStrategy,
  // 结果类型
  ListResult,
  NormalizedResult,
  // 通知与错误
  Notifier,
  HttpError,
  ErrorContext,
  // 主类型
  UsePageCrudOptions,
  UsePageCrudReturn,
} from './types'

// ==================== 工具函数 ====================
export {
  // 序列化器
  Serializers,
  // 错误检测
  ErrorDetector,
  // 自动刷新
  AutoRefresh,
  // 文件工具
  FileUtils,
  // 响应处理
  ResponseNormalizer,
  // 配置合并
  ConfigMerger,
} from './utils'

// ==================== API 解析 ====================
export { normalizeApi } from './apiParser'

// ==================== 消息通知 ====================
export { createAutoNotifier, createConsoleNotifier } from './notifier'

// ==================== 常量 ====================
export { DEFAULT_MESSAGES, DEFAULT_ENDPOINT_OPTIONS } from './constants'
