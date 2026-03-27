/*
 * @Description: 联邦共享层 — 公共类型定义
 * Host (robotAdmin) 和所有应用共享的 TypeScript 类型
 * 独立仓库模式下可通过 npm 包 @robot-admin/federation 引用
 */

// =================== 联邦模块声明 ===================

/** 远程模块加载状态 */
export type RemoteModuleStatus = 'idle' | 'loading' | 'loaded' | 'error'

/** 远程模块元信息 */
export interface RemoteModuleInfo {
  /** 远程应用名称 */
  name: string
  /** remoteEntry.js URL */
  entry: string
  /** 模块暴露路径，如 './Table' */
  exposedModule: string
  /** 当前加载状态 */
  status: RemoteModuleStatus
}

// =================== 通用业务类型 ===================

/** 分页参数 */
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

/** 通用 API 响应格式 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

/** 表格列定义（供 C_Table 远程组件使用） */
export interface TableColumn {
  prop: string
  label: string
  width?: number | string
  fixed?: 'left' | 'right'
  sortable?: boolean
  slot?: string
}

/** 表单项定义（供 C_Form 远程组件使用） */
export interface FormItemOption {
  prop: string
  label: string
  type:
    | 'input'
    | 'select'
    | 'date'
    | 'switch'
    | 'radio'
    | 'checkbox'
    | 'textarea'
  placeholder?: string
  options?: { label: string; value: string | number }[]
  rules?: Record<string, any>[]
}
