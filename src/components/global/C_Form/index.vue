<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-10 13:21:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 20:51:51
 * @FilePath: \Robot_Admin\src\components\global\C_Form\index.vue
 * @Description: 表单组件 — 薄 UI 壳 + 厚 Composable 引擎
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
    :label-placement="resolved.labelPlacement"
    :label-width="resolved.labelWidth"
    :size="resolved.size"
    :disabled="resolved.disabled"
    :readonly="resolved.readonly"
    v-bind="$attrs"
  >
    <!-- 布局组件渲染 -->
    <component
      :is="layoutComponent"
      :form-items="formItems"
      :layout-config="mergedLayoutConfig"
      :options="visibleOptions"
      :form-data="formModel"
      @tab-change="handleLayoutEvent('onTabChange', $event)"
      @tab-validate="handleLayoutEvent('onTabValidate', $event)"
      @step-change="handleStepChange"
      @step-before-change="handleStepBeforeChange"
      @step-validate="handleStepValidate"
      @field-add="handleLayoutEvent('onFieldAdd', $event)"
      @field-remove="handleLayoutEvent('onFieldRemove', $event)"
      @field-toggle="
        (id: string, visible: boolean) => resolved.onFieldToggle?.(id, visible)
      "
      @fields-clear="handleLayoutEvent('onFieldsClear')"
      @render-mode-change="handleLayoutEvent('onRenderModeChange', $event)"
      @group-toggle="
        (key: string, collapsed: boolean) =>
          resolved.onGroupToggle?.(key, collapsed)
      "
      @group-reset="handleLayoutEvent('onGroupReset', $event)"
      @validate-success="(model: FormModel) => emit('validate-success', model)"
      @validate-error="(errors: unknown) => emit('validate-error', errors)"
      @fields-change="handleFieldsChange"
    />

    <!-- 表单操作按钮区域（只在特定布局中显示） -->
    <NFormItem
      v-if="showActions"
      class="mt-5"
    >
      <slot
        name="action"
        :form="formRef"
        :model="formModel"
        :validate="validate"
        :validateField="validateField"
        :reset="resetFields"
        :setFields="setFields"
        :getModel="getModel"
        :clearValidation="clearValidation"
      >
        <NSpace>
          <NButton
            type="primary"
            @click="handleSubmit"
            >提交</NButton
          >
          <NButton @click="handleReset">重置</NButton>
        </NSpace>
      </slot>
    </NFormItem>
  </NForm>
</template>

<script lang="ts" setup>
  import type { FormInst } from 'naive-ui/es/form'
  import type {
    FormOption,
    LayoutType,
    LayoutConfig,
    SubmitEventPayload,
    FormModel,
  } from '@/types/modules/form'
  import {
    type FormConfig,
    resolveFormConfig,
    shouldShowActions as calcShowActions,
  } from '@/composables/Form/useFormConfig'
  import { useFormState } from '@/composables/Form/useFormState'
  import {
    useFormRenderer,
    type ComponentMap,
  } from '@/composables/Form/useFormRenderer'

  // ===== 布局组件静态映射（取代 DynamicComponent） =====
  import DefaultLayout from './layouts/Default/index.vue'
  import InlineLayout from './layouts/Inline/index.vue'
  import GridLayout from './layouts/Grid/index.vue'
  import CardLayout from './layouts/Card/index.vue'
  import TabsLayout from './layouts/Tabs/index.vue'
  import StepsLayout from './layouts/Steps/index.vue'
  import DynamicLayout from './layouts/Dynamic/index.vue'
  import CustomLayout from './layouts/Custom/index.vue'

  const LAYOUT_MAP: Record<LayoutType, any> = {
    default: DefaultLayout,
    inline: InlineLayout,
    grid: GridLayout,
    card: CardLayout,
    tabs: TabsLayout,
    steps: StepsLayout,
    dynamic: DynamicLayout,
    custom: CustomLayout,
  } as const

  // ===== Naive UI 组件解析映射 =====
  // 必须在 <script setup> 中调用 resolveComponent，
  // unplugin-vue-components 只在 .vue SFC 中转换这些调用
  const COMPONENT_MAP: ComponentMap = {
    NFormItem: resolveComponent('NFormItem'),
    NInput: resolveComponent('NInput'),
    NInputNumber: resolveComponent('NInputNumber'),
    NSwitch: resolveComponent('NSwitch'),
    NSlider: resolveComponent('NSlider'),
    NRate: resolveComponent('NRate'),
    NDatePicker: resolveComponent('NDatePicker'),
    NTimePicker: resolveComponent('NTimePicker'),
    NCascader: resolveComponent('NCascader'),
    NColorPicker: resolveComponent('NColorPicker'),
    NSelect: resolveComponent('NSelect'),
    NCheckboxGroup: resolveComponent('NCheckboxGroup'),
    NCheckbox: resolveComponent('NCheckbox'),
    NRadioGroup: resolveComponent('NRadioGroup'),
    NRadio: resolveComponent('NRadio'),
    NUpload: resolveComponent('NUpload'),
    NButton: resolveComponent('NButton'),
    NSpace: resolveComponent('NSpace'),
    C_Editor: resolveComponent('C_Editor'),
  } as ComponentMap

  // ================= 组件属性定义 =================

  interface CFormProps {
    /** 字段配置数组 */
    options: FormOption[]
    /** 双向绑定表单数据 */
    modelValue?: FormModel
    /** 统一配置对象（收拢原先 13 个分散 Props） */
    config?: FormConfig
  }

  const props = withDefaults(defineProps<CFormProps>(), {
    config: () => ({}),
  })

  // ================= 组件事件定义（从 16 个精简到 4 个） =================

  const emit = defineEmits<{
    submit: [payload: SubmitEventPayload]
    'update:modelValue': [model: FormModel]
    'validate-success': [model: FormModel]
    'validate-error': [errors: unknown]
  }>()

  // ================= 配置解析 =================

  const resolved = computed(() => resolveFormConfig(props.config))

  // ================= 响应式状态 =================

  const formRef = ref<FormInst | null>(null)
  const optionsRef = computed(() => props.options)

  // ===== 状态引擎 =====
  const {
    formModel,
    formRules,
    visibleOptions,
    initialize,
    handleFieldChange,
    validate,
    validateField,
    validateStep,
    validateTab,
    validateDynamicFields,
    validateCustomGroup,
    clearValidation,
    getModel,
    setFields,
    resetFields,
    setFieldValue,
    getFieldValue,
    setFieldsValue,
    handleSubmit,
    handleReset,
  } = useFormState(optionsRef, resolved, formRef, emit)

  // ===== 渲染引擎 =====
  const currentInstance = getCurrentInstance()
  const { formItems } = useFormRenderer(
    formModel,
    visibleOptions,
    resolved,
    handleFieldChange,
    COMPONENT_MAP,
    currentInstance?.slots
  )

  // ================= 计算属性 =================

  const layoutComponent = computed(
    () => LAYOUT_MAP[resolved.value.layout] || LAYOUT_MAP.default
  )

  const mergedLayoutConfig = computed<LayoutConfig>(() => ({
    type: resolved.value.layout,
    grid: resolved.value.grid,
    inline: resolved.value.inline,
    card: resolved.value.card,
    tabs: resolved.value.tabs,
    steps: resolved.value.steps,
    dynamic: resolved.value.dynamic,
    custom: resolved.value.custom,
  }))

  const showActions = computed(() => calcShowActions(resolved.value))

  // ================= 布局事件 → config 回调桥接 =================

  /** 通用布局事件桥接 */
  const handleLayoutEvent = (callbackName: string, ...args: any[]) => {
    const callback = (resolved.value as any)[callbackName]
    callback?.(...args)
  }

  /** 字段变化事件（保留回调通道） */
  const handleFieldsChange = (fields: FormOption[]): void => {
    resolved.value.onFieldsChange?.(fields)
  }

  /** Steps 布局事件 — 需要多参数特殊处理 */
  const handleStepChange = (stepIndex: number, stepKey: string): void => {
    resolved.value.onStepChange?.(stepIndex, stepKey)
  }

  const handleStepBeforeChange = async (
    currentStep: number,
    targetStep: number
  ): Promise<boolean> => {
    resolved.value.onStepBeforeChange?.(currentStep, targetStep)
    return true
  }

  const handleStepValidate = async (stepIndex: number): Promise<boolean> => {
    try {
      const currentStepKey = resolved.value.steps?.steps?.[stepIndex]?.key
      if (!currentStepKey) return true

      const stepFields = props.options
        .filter(option => option.layout?.step === currentStepKey)
        .map(option => option.prop)

      if (stepFields.length === 0) return true

      await validateField(stepFields)
      resolved.value.onStepValidate?.(stepIndex)
      return true
    } catch (error) {
      console.warn(`[C_Form] 步骤 ${stepIndex} 验证失败:`, error)
      return false
    }
  }

  // ================= modelValue 双向同步 =================

  watch(
    () => props.modelValue,
    val => {
      if (val) Object.assign(formModel, val)
    },
    { immediate: true, deep: true }
  )

  // ================= 组件暴露 =================

  defineExpose({
    validate,
    validateField,
    validateStep,
    validateTab,
    validateDynamicFields,
    validateCustomGroup,
    clearValidation,
    getModel,
    setFields,
    resetFields,
    setFieldValue,
    getFieldValue,
    setFieldsValue,
    formRef,
    formModel,
    initialize,
    layoutType: computed(() => resolved.value.layout),
    shouldShowDefaultActions: showActions,
  })
</script>
