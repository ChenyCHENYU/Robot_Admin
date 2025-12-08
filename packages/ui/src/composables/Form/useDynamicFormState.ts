/**
 * * @description 动态表单状态管理组合式函数
 * ? @module useDynamicFormState
 * ! @returns 包含动态表单状态和操作方法的对象
 */

import type {
  FormOption,
  ComponentType,
  DynamicFieldConfig,
  DynamicFormConfig,
  DynamicFormState,
} from '@/types/modules/form'

/**
 * * @description 默认表单配置
 * ! @type {DynamicFormConfig}
 */
const DEFAULT_CONFIG: DynamicFormConfig = {
  maxFields: 20,
  autoSave: false,
  enableSort: true,
  showControls: true,
  showItemControls: true,
}

/**
 * * @description 可用的字段类型选项
 * ! @type {Array<{label: string, value: ComponentType}>}
 */
export const FIELD_TYPE_OPTIONS = [
  { label: '文本输入', value: 'input' as ComponentType },
  { label: '数字输入', value: 'inputNumber' as ComponentType },
  { label: '多行文本', value: 'textarea' as ComponentType },
  { label: '下拉选择', value: 'select' as ComponentType },
  { label: '开关切换', value: 'switch' as ComponentType },
  { label: '评分组件', value: 'rate' as ComponentType },
]

/**
 * * @description 创建和管理动态表单状态
 * ! @returns {Object} 包含状态和方法的对象
 */
export const useDynamicFormState = () => {
  /**
   * * @description 响应式表单状态
   * ! @type {DynamicFormState}
   */
  const state = reactive<DynamicFormState>({
    config: { ...DEFAULT_CONFIG },
    baseFields: [],
    dynamicFields: [],
    hiddenFieldIds: new Set<string>(),
    fieldCounter: 0,
    isInitialized: false,
  })

  /**
   * * @description 计算所有字段（基础字段+动态字段）
   * ! @type {ComputedRef<FormOption[]>}
   */
  const allFields = computed<FormOption[]>(() => [
    ...state.baseFields,
    ...state.dynamicFields.map(field => ({
      ...field,
      show: !state.hiddenFieldIds.has(field.prop),
    })),
  ])

  /**
   * * @description 计算可见字段
   * ! @type {ComputedRef<FormOption[]>}
   */
  const visibleFields = computed<FormOption[]>(() =>
    allFields.value.filter(field => field.show !== false)
  )

  /**
   * * @description 计算动态字段数量
   * ! @type {ComputedRef<number>}
   */
  const dynamicFieldsCount = computed(() => state.dynamicFields.length)

  /**
   * * @description 计算隐藏字段数量
   * ! @type {ComputedRef<number>}
   */
  const hiddenFieldsCount = computed(() => state.hiddenFieldIds.size)

  /**
   * * @description 是否可以添加更多字段
   * ! @type {ComputedRef<boolean>}
   */
  const canAddMoreFields = computed(
    () => state.dynamicFields.length < state.config.maxFields
  )

  /**
   * * @description 是否所有字段都可见
   * ! @type {ComputedRef<boolean>}
   */
  const allVisible = computed(() => state.hiddenFieldIds.size === 0)

  /**
   * * @description 添加动态字段
   * ? @param {Partial<DynamicFieldConfig>} config - 字段配置
   */
  const addField = (config: Partial<DynamicFieldConfig> = {}) => {
    if (!canAddMoreFields.value) {
      console.warn('[useDynamicFormState] 已达到最大字段数量限制')
      return
    }

    state.fieldCounter++

    const defaultType =
      config.type ||
      FIELD_TYPE_OPTIONS[Math.floor(Math.random() * FIELD_TYPE_OPTIONS.length)]
        .value

    const newField: DynamicFieldConfig = {
      id: `dynamic_field_${state.fieldCounter}`,
      type: defaultType,
      prop: config.prop || `dynamic_${state.fieldCounter}`,
      label: config.label || `动态字段 ${state.fieldCounter}`,
      placeholder: config.placeholder || `请输入${config.label || '内容'}`,
      visible: true,
      removable: true,
      created: Date.now(),
      layout: config.layout || { span: 12 },
      ...config,
    }

    state.dynamicFields.push(newField)

    console.log('[useDynamicFormState] 添加字段:', newField)
  }

  /**
   * * @description 移除动态字段
   * ? @param {number} [index] - 可选，要移除的字段索引，默认移除最后一个
   */
  const removeField = (index?: number) => {
    if (state.dynamicFields.length === 0) {
      console.warn('[useDynamicFormState] 没有可移除的动态字段')
      return
    }

    const targetIndex = index ?? state.dynamicFields.length - 1

    if (targetIndex < 0 || targetIndex >= state.dynamicFields.length) {
      console.warn('[useDynamicFormState] 字段索引超出范围')
      return
    }

    const removed = state.dynamicFields.splice(targetIndex, 1)[0]
    if (removed) {
      state.hiddenFieldIds.delete(removed.prop)
      console.log('[useDynamicFormState] 移除字段:', removed.prop)
    }
  }

  /**
   * * @description 清空所有动态字段
   */
  const clearDynamicFields = () => {
    console.log(
      '[useDynamicFormState] 清空动态字段:',
      state.dynamicFields.length
    )
    state.dynamicFields.forEach(field =>
      state.hiddenFieldIds.delete(field.prop)
    )
    state.dynamicFields.length = 0
    state.fieldCounter = 0
  }

  /**
   * * @description 切换字段可见性
   * ? @param {string} fieldId - 字段ID
   */
  const toggleFieldVisibility = (fieldId: string) => {
    if (state.hiddenFieldIds.has(fieldId)) {
      state.hiddenFieldIds.delete(fieldId)
      console.log('[useDynamicFormState] 显示字段:', fieldId)
    } else {
      state.hiddenFieldIds.add(fieldId)
      console.log('[useDynamicFormState] 隐藏字段:', fieldId)
    }
  }

  /**
   * * @description 切换所有字段可见性
   */
  const toggleAllVisibility = () => {
    if (allVisible.value) {
      state.dynamicFields.forEach(field => {
        state.hiddenFieldIds.add(field.prop)
      })
      console.log('[useDynamicFormState] 隐藏所有动态字段')
    } else {
      state.hiddenFieldIds.clear()
      console.log('[useDynamicFormState] 显示所有字段')
    }
  }

  /**
   * * @description 更新表单配置
   * ? @param {Partial<DynamicFormConfig>} newConfig - 新的配置对象
   */
  const updateConfig = (newConfig: Partial<DynamicFormConfig>) => {
    Object.assign(state.config, newConfig)
    console.log('[useDynamicFormState] 更新配置:', newConfig)
  }

  /**
   * * @description 导出当前表单配置
   * ! @returns {string} JSON格式的配置字符串
   */
  const exportConfig = () => {
    const config = {
      baseFields: state.baseFields,
      dynamicFields: state.dynamicFields,
      config: state.config,
      hiddenFields: Array.from(state.hiddenFieldIds),
      timestamp: Date.now(),
    }
    return JSON.stringify(config, null, 2)
  }

  /**
   * * @description 初始化表单状态
   * ? @param {FormOption[]} baseFields - 基础字段配置
   * ? @param {Partial<DynamicFormConfig>} [config] - 可选，表单配置
   */
  const initialize = (
    baseFields: FormOption[],
    config: Partial<DynamicFormConfig> = {}
  ) => {
    console.log('[useDynamicFormState] 初始化状态:', {
      baseFieldsCount: baseFields.length,
      config,
    })

    state.baseFields = [...baseFields]
    Object.assign(state.config, config)
    state.isInitialized = true

    console.log('[useDynamicFormState] 初始化完成')
  }

  return {
    state: readonly(state),
    allFields,
    visibleFields,
    dynamicFieldsCount,
    hiddenFieldsCount,
    canAddMoreFields,
    allVisible,
    FIELD_TYPE_OPTIONS,
    addField,
    removeField,
    clearDynamicFields,
    toggleFieldVisibility,
    toggleAllVisibility,
    updateConfig,
    exportConfig,
    initialize,
  }
}

/**
 * * @description 动态表单状态类型
 * ! @typedef {ReturnType<typeof useDynamicFormState>} DynamicFormStateType
 */
export type DynamicFormStateType = ReturnType<typeof useDynamicFormState>

/**
 * * @description 动态表单状态注入键
 * ! @type {symbol}
 */
export const DYNAMIC_FORM_STATE_KEY = Symbol('dynamicFormState')
