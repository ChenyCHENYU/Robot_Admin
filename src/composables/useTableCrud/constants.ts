/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-06
 * @Description: useTableCrud 常量定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  /** 默认 ID 字段名 */
  idKey: 'id',
  /** 默认分页大小 */
  pageSize: 10,
  /** 默认启用分页 */
  paginationEnabled: true,
  /** 默认当前页 */
  currentPage: 1,
} as const

/**
 * 响应字段别名配置（支持多种后端响应格式）
 */

/** 数据字段别名（按优先级排序） - 用于从响应中提取数据层 */
export const DATA_FIELD_ALIASES = ['data', 'list', 'items', 'records'] as const

/** 列表字段别名（按优先级排序） - 用于从数据层提取列表数组 */
export const LIST_FIELD_ALIASES = [
  'list',
  'items',
  'records',
  'rows',
  'data',
] as const

/** 总数字段别名（按优先级排序） - 用于提取数据总数 */
export const TOTAL_FIELD_ALIASES = [
  'total',
  'totalCount',
  'count',
  'totalElements',
] as const

/** 成功状态码（支持数字和字符串） */
export const SUCCESS_CODES = [200, 0, '200', '0'] as const

/**
 * 默认消息文本
 */
export const DEFAULT_MESSAGES = {
  createSuccess: '新增成功',
  updateSuccess: '更新成功',
  deleteSuccess: '删除成功',
  saveError: '保存失败',
  deleteError: '删除失败',
  loadError: '数据加载失败',
  detailError: '详情获取失败',
  noDeleteApi: '未配置删除接口',
} as const
