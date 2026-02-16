/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: C_Form 配置解析 Composable — 统一 FormConfig 接口与默认值
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  LayoutType,
  LabelPlacement,
  GridLayoutConfig,
  InlineLayoutConfig,
  CardLayoutConfig,
  TabsLayoutConfig,
  StepsLayoutConfig,
  DynamicLayoutConfig,
  CustomLayoutConfig,
  DynamicFieldConfig,
  RenderMode,
  FormOption,
} from '@/types/modules/form'

// =================== FormConfig 类型定义 ===================

/** 布局回调事件 — 替代原先 16 个 emit 中的纯透传事件 */
export interface LayoutCallbacks {
  // tabs 布局回调
  onTabChange?: (tabKey: string, tabIndex: number) => void
  onTabValidate?: (tabKey: string) => void

  // steps 布局回调
  onStepChange?: (stepIndex: number, stepKey: string) => void
  onStepBeforeChange?: (currentStep: number, targetStep: number) => void
  onStepValidate?: (stepIndex: number) => void

  // dynamic 布局回调
  onFieldAdd?: (fieldConfig: DynamicFieldConfig) => void
  onFieldRemove?: (fieldId: string) => void
  onFieldToggle?: (fieldId: string, visible: boolean) => void
  onFieldsClear?: () => void

  // custom 布局回调
  onRenderModeChange?: (mode: RenderMode) => void
  onGroupToggle?: (groupKey: string, collapsed: boolean) => void
  onGroupReset?: (groupKey: string) => void
  onFieldsChange?: (fields: FormOption[]) => void
}

/**
 * C_Form 统一配置接口
 * @description 收拢原先 13 个分散 Props 为 1 个 config 对象
 * 默认值均在 FORM_DEFAULTS 中集中管理
 */
export interface FormConfig extends LayoutCallbacks {
  /** 布局类型，默认 'default' */
  layout?: LayoutType
  /** 标签位置，默认 'left' */
  labelPlacement?: LabelPlacement
  /** 标签宽度，默认 'auto' */
  labelWidth?: string | number
  /** 尺寸，默认 'medium' */
  size?: 'small' | 'medium' | 'large'
  /** 禁用整个表单，默认 false */
  disabled?: boolean
  /** 只读，默认 false */
  readonly?: boolean
  /** 显示默认提交/重置按钮，默认 true */
  showActions?: boolean
  /** 值变化时自动校验，默认 false */
  validateOnChange?: boolean

  // ===== 布局级配置 =====
  grid?: GridLayoutConfig
  inline?: InlineLayoutConfig
  card?: CardLayoutConfig
  tabs?: TabsLayoutConfig
  steps?: StepsLayoutConfig
  dynamic?: DynamicLayoutConfig
  custom?: CustomLayoutConfig
}

/** 解析后的配置（所有必填字段均已设置默认值） */
export interface ResolvedFormConfig extends Required<
  Omit<
    FormConfig,
    | keyof LayoutCallbacks
    | 'grid'
    | 'inline'
    | 'card'
    | 'tabs'
    | 'steps'
    | 'dynamic'
    | 'custom'
  >
> {
  // 布局配置保留可选，因为只有对应 layout 时才有值
  grid?: GridLayoutConfig
  inline?: InlineLayoutConfig
  card?: CardLayoutConfig
  tabs?: TabsLayoutConfig
  steps?: StepsLayoutConfig
  dynamic?: DynamicLayoutConfig
  custom?: CustomLayoutConfig
  // 回调保留可选
  onTabChange?: LayoutCallbacks['onTabChange']
  onTabValidate?: LayoutCallbacks['onTabValidate']
  onStepChange?: LayoutCallbacks['onStepChange']
  onStepBeforeChange?: LayoutCallbacks['onStepBeforeChange']
  onStepValidate?: LayoutCallbacks['onStepValidate']
  onFieldAdd?: LayoutCallbacks['onFieldAdd']
  onFieldRemove?: LayoutCallbacks['onFieldRemove']
  onFieldToggle?: LayoutCallbacks['onFieldToggle']
  onFieldsClear?: LayoutCallbacks['onFieldsClear']
  onRenderModeChange?: LayoutCallbacks['onRenderModeChange']
  onGroupToggle?: LayoutCallbacks['onGroupToggle']
  onGroupReset?: LayoutCallbacks['onGroupReset']
  onFieldsChange?: LayoutCallbacks['onFieldsChange']
}

// =================== 默认值常量 ===================

export const FORM_DEFAULTS: ResolvedFormConfig = {
  layout: 'default',
  labelPlacement: 'left',
  labelWidth: 'auto',
  size: 'medium',
  disabled: false,
  readonly: false,
  showActions: true,
  validateOnChange: false,
} as const

/** 拥有自身控制按钮的布局（不显示默认操作按钮） */
export const LAYOUTS_WITH_OWN_CONTROLS: readonly LayoutType[] = [
  'steps',
  'custom',
] as const

// =================== 核心函数 ===================

/**
 * 解析 FormConfig，合并默认值
 * @param config - 用户传入的配置（可选）
 * @returns 具有完整默认值的 ResolvedFormConfig
 */
export function resolveFormConfig(config?: FormConfig): ResolvedFormConfig {
  return { ...FORM_DEFAULTS, ...config }
}

/**
 * 计算是否显示默认操作按钮
 * @param resolved - 已解析的配置
 */
export function shouldShowActions(resolved: ResolvedFormConfig): boolean {
  if (resolved.showActions === false) return false
  if (LAYOUTS_WITH_OWN_CONTROLS.includes(resolved.layout)) return false
  return true
}
