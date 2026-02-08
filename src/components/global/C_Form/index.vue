<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-10 13:21:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 20:51:51
 * @FilePath: \Robot_Admin\src\components\global\C_Form\index.vue
 * @Description: 表单组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <NForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    :validate-on-rule-change="false"
    :label-placement="labelPlacement"
    :label-width="labelWidth"
    :size="size"
    :disabled="disabled"
    :readonly="readonly"
    v-bind="$attrs"
  >
    <!-- 动态组件渲染 -->
    <DynamicComponent
      :name="layoutComponentName"
      :form-items="formItems"
      :layout-config="mergedLayoutConfig"
      :options="visibleOptions"
      :form-data="formModel"
      :show-default-actions="shouldShowDefaultActions"
      @tab-change="handleTabChange"
      @step-change="handleStepChange"
      @step-before-change="handleStepBeforeChange"
      @step-validate="handleStepValidate"
      @field-add="handleFieldAdd"
      @field-remove="handleFieldRemove"
      @field-toggle="handleFieldToggle"
      @fields-clear="handleFieldsClear"
      @render-mode-change="handleRenderModeChange"
      @group-toggle="handleGroupToggle"
      @group-reset="handleGroupReset"
      @validate-success="(model: FormModel) => emit('validate-success', model)"
      @validate-error="(errors: unknown) => emit('validate-error', errors)"
      @fields-change="handleFieldsChange"
    />

    <!-- 表单操作按钮区域（只在特定布局中显示） -->
    <NFormItem
      v-if="shouldShowDefaultActions"
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
  import type { FormInst, FormRules } from 'naive-ui/es/form'
  import { mergeRules } from '@robot-admin/form-validate'
  import type {
    FormProps,
    FormOption,
    LayoutType,
    LayoutConfig,
    OptionItem,
    ComponentType,
    SubmitEventPayload,
    EditorEventPayload,
    DynamicFieldConfig,
    RenderMode,
    FormModel,
  } from '@/types/modules/form'

  // ================= 组件属性定义 =================

  const props = withDefaults(defineProps<FormProps>(), {
    layoutType: 'default',
    layoutConfig: () => ({}),
    validateOnValueChange: false,
    labelPlacement: 'left',
    labelWidth: 'auto',
    size: 'medium',
    disabled: false,
    readonly: false,
    showDefaultActions: true,
  })

  // ================= 组件事件定义 =================

  const emit = defineEmits<{
    submit: [payload: SubmitEventPayload]
    'update:modelValue': [model: FormModel]
    'validate-success': [model: FormModel]
    'validate-error': [errors: unknown]
    'fields-change': [fields: FormOption[]] // 🎯 添加字段变化事件
    'editor-mounted': [payload: EditorEventPayload]
    'on-preview': [file: any]
    'on-remove': [file: any]
    'before-remove': [file: any]
    'on-exceed': [data: any]
    'on-success': [data: any]
    'tab-change': [tabKey: string]
    'step-change': [stepIndex: number, stepKey: string]
    'step-before-change': [currentStep: number, targetStep: number]
    'step-validate': [stepIndex: number]
    'field-add': [fieldConfig: DynamicFieldConfig]
    'field-remove': [fieldId: string]
    'field-toggle': [fieldId: string, visible: boolean]
    'fields-clear': []
    'render-mode-change': [mode: RenderMode]
    'group-toggle': [groupKey: string, collapsed: boolean]
    'group-reset': [groupKey: string]
  }>()

  // ================= 响应式状态管理 =================

  const formRef = ref<FormInst | null>(null)
  const formModel = reactive<FormModel>({})
  const formRules = reactive<FormRules>({})

  // ================= 常量映射 =================

  const LAYOUT_COMPONENT_MAP: Record<LayoutType, string> = {
    default: 'Default',
    inline: 'Inline',
    grid: 'Grid',
    card: 'Card',
    tabs: 'Tabs',
    steps: 'Steps',
    dynamic: 'Dynamic',
    custom: 'Custom',
  } as const

  const COMPONENT_MAP: Partial<Record<ComponentType, any>> = {
    input: resolveComponent('NInput'),
    textarea: resolveComponent('NInput'),
    inputNumber: resolveComponent('NInputNumber'),
    switch: resolveComponent('NSwitch'),
    slider: resolveComponent('NSlider'),
    rate: resolveComponent('NRate'),
    datePicker: resolveComponent('NDatePicker'),
    daterange: resolveComponent('NDatePicker'),
    timePicker: resolveComponent('NTimePicker'),
    cascader: resolveComponent('NCascader'),
    colorPicker: resolveComponent('NColorPicker'),
  } as const

  const SPECIAL_TYPES: readonly ComponentType[] = [
    'select',
    'checkbox',
    'radio',
    'upload',
    'editor',
  ] as const

  const DEFAULT_VALUES: Record<ComponentType, any> = {
    input: '',
    textarea: '',
    editor: '',
    select: null,
    datePicker: null,
    daterange: null,
    timePicker: null,
    cascader: null,
    colorPicker: null,
    checkbox: null,
    upload: [],
    radio: '',
    inputNumber: null,
    slider: null,
    rate: null,
    switch: null,
  } as const

  const LAYOUTS_WITH_OWN_CONTROLS: readonly LayoutType[] = [
    'steps',
    'custom',
  ] as const

  // ================= 计算属性 =================

  const layoutComponentName = computed(
    () => LAYOUT_COMPONENT_MAP[props.layoutType] || LAYOUT_COMPONENT_MAP.default
  )

  const mergedLayoutConfig = computed<LayoutConfig>(() => ({
    type: props.layoutType,
    ...props.layoutConfig,
  }))

  const shouldShowDefaultActions = computed(() => {
    if (props.showDefaultActions === false) {
      return false
    }

    if (LAYOUTS_WITH_OWN_CONTROLS.includes(props.layoutType)) {
      return false
    }

    return true
  })

  const visibleOptions = computed(() =>
    props.options.filter(item => item.show !== false)
  )

  const formItems = computed(() =>
    visibleOptions.value.map(item =>
      h(
        resolveComponent('NFormItem'),
        {
          label: item.label,
          path: item.prop,
          key: item.prop,
          required: !!item.rules?.length,
        },
        {
          default: () => renderFormItem(item),
        }
      )
    )
  )

  // ================= 核心渲染逻辑 =================

  const renderFormItem = (item: FormOption): VNode | null => {
    try {
      if (SPECIAL_TYPES.includes(item.type as ComponentType)) {
        return renderSpecialComponent(item)
      }

      const Component = COMPONENT_MAP[item.type as ComponentType]
      if (!Component) {
        console.warn(`[C_Form] 未支持的组件类型: ${item.type}`)
        return null
      }

      return h(Component, {
        ...getBaseProps(item),
        ...item.attrs,
      })
    } catch (error) {
      console.error(`[C_Form] 渲染表单项失败:`, error, item)
      return null
    }
  }

  const renderSpecialComponent = (item: FormOption): VNode | null => {
    const baseProps = getBaseProps(item)

    switch (item.type) {
      case 'select':
        return h(resolveComponent('NSelect'), {
          ...baseProps,
          options:
            item.children?.map((child: OptionItem) => ({
              value: child.value,
              label: child.label,
              disabled: child.disabled,
            })) || [],
          ...item.attrs,
        })

      case 'checkbox':
        return h(
          resolveComponent('NCheckboxGroup'),
          { ...baseProps, ...item.attrs },
          {
            default: () =>
              h(
                resolveComponent('NSpace'),
                {},
                {
                  default: () =>
                    item.children?.map((child: OptionItem) =>
                      h(resolveComponent('NCheckbox'), {
                        value: child.value,
                        label: child.label,
                        disabled: child.disabled,
                        key: String(child.value),
                      })
                    ) || [],
                }
              ),
          }
        )

      case 'radio':
        return h(
          resolveComponent('NRadioGroup'),
          { ...baseProps, ...item.attrs },
          {
            default: () =>
              h(
                resolveComponent('NSpace'),
                {},
                {
                  default: () =>
                    item.children?.map((child: OptionItem) =>
                      h(
                        resolveComponent('NRadio'),
                        {
                          value: child.value,
                          disabled: child.disabled,
                          key: String(child.value),
                        },
                        { default: () => child.label }
                      )
                    ) || [],
                }
              ),
          }
        )

      case 'upload':
        return renderUploadComponent(item)

      case 'editor':
        return renderEditorComponent(item)

      default:
        return null
    }
  }

  const renderEditorComponent = (item: FormOption): VNode => {
    return h(resolveComponent('C_Editor'), {
      editorId: `editor-${item.prop}`,
      modelValue: formModel[item.prop] || '',
      placeholder: item.placeholder,
      disabled: props.disabled,
      readonly: props.readonly,
      'onUpdate:modelValue': (value: string) => {
        formModel[item.prop] = value
        handleFieldChange(item.prop)
      },
      'onEditor-mounted': (editor: any) => {
        emit('editor-mounted', {
          editor,
          prop: item.prop,
          html: formModel[item.prop] || '',
        })
      },
      ...item.attrs,
    })
  }

  const renderUploadComponent = (item: FormOption): VNode => {
    const currentInstance = getCurrentInstance()

    return h(
      resolveComponent('NUpload'),
      {
        fileList: formModel[item.prop] || [],
        'onUpdate:fileList': (fileList: any[]) => {
          formModel[item.prop] = fileList
          handleFieldChange(item.prop)
        },
        onPreview: (file: any) => emit('on-preview', file),
        onRemove: (file: any) => emit('on-remove', file),
        onBeforeRemove: (file: any) => emit('before-remove', file),
        onExceed: (data: any) => emit('on-exceed', data),
        onSuccess: (data: any) => emit('on-success', data),
        ...item.attrs,
      },
      {
        trigger: () =>
          currentInstance?.slots['uploadClick']?.() ||
          h(
            resolveComponent('NButton'),
            { type: 'primary' },
            { default: () => '选择文件' }
          ),
        tip: () => currentInstance?.slots['uploadTip']?.() || null,
      }
    )
  }

  const getBaseProps = (item: FormOption): Record<string, any> => {
    const baseProps: Record<string, any> = {
      value: formModel[item.prop],
      'onUpdate:value': (value: any) => {
        formModel[item.prop] = value
        handleFieldChange(item.prop)
      },
    }

    if (item.type === 'textarea') {
      baseProps.type = 'textarea'
    }

    if (item.placeholder) {
      baseProps.placeholder = item.placeholder
    }

    return baseProps
  }

  // ================= 工具函数 =================

  const getDefaultValue = (type: ComponentType): any => {
    return DEFAULT_VALUES[type] ?? null
  }

  const handleFieldChange = (field: string): void => {
    if (props.validateOnValueChange) {
      nextTick(() => {
        validateField(field).catch(() => {})
      })
    }
  }

  // ================= 初始化逻辑 =================

  const initialize = (): void => {
    try {
      // 清空现有规则
      Object.keys(formRules).forEach(key => delete formRules[key])

      // 初始化表单数据和验证规则
      props.options.forEach(item => {
        formModel[item.prop] =
          item.value !== undefined
            ? item.value
            : getDefaultValue(item.type as ComponentType)

        if (item.rules?.length) {
          formRules[item.prop] = mergeRules(item.rules)
        }
      })
    } catch (error) {
      console.error('[C_Form] 初始化失败:', error)
    }
  }

  // ================= 验证相关方法 =================

  const validate = async (): Promise<void> => {
    if (!formRef.value) {
      throw new Error('[C_Form] 表单引用不存在')
    }

    try {
      await formRef.value.validate()
      emit('validate-success', getModel())
    } catch (errors) {
      emit('validate-error', errors)
      throw errors
    }
  }

  const validateField = async (field: string | string[]): Promise<void> => {
    if (!formRef.value) {
      throw new Error('[C_Form] 表单引用不存在')
    }

    const fields = Array.isArray(field) ? field : [field]
    await formRef.value.validate(fields as any)
  }

  const clearValidation = (field?: string | string[]): void => {
    if (!formRef.value) return

    if (field) {
      const fields = Array.isArray(field) ? field : [field]
      fields.forEach(fieldName => {
        if (formModel[fieldName] !== undefined) {
          const currentValue = formModel[fieldName]
          formModel[fieldName] = currentValue
        }
      })
    } else {
      formRef.value.restoreValidation()
    }
  }

  const validateByFilter = async (
    filterFn: (option: FormOption) => boolean,
    context: string
  ): Promise<boolean> => {
    try {
      const fields = props.options.filter(filterFn).map(option => option.prop)

      if (fields.length === 0) return true
      await validateField(fields)
      return true
    } catch (error) {
      console.warn(`[C_Form] ${context}验证失败:`, error)
      return false
    }
  }

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const stepKey = props.layoutConfig?.steps?.steps?.[stepIndex]?.key
    if (!stepKey) return true

    return validateByFilter(
      option => option.layout?.step === stepKey,
      `步骤 ${stepIndex} `
    )
  }

  const validateTab = async (tabKey: string): Promise<boolean> => {
    return validateByFilter(
      option => option.layout?.tab === tabKey,
      `标签页 ${tabKey} `
    )
  }

  const validateDynamicFields = async (): Promise<boolean> => {
    return validateByFilter(
      option => Boolean(option.layout?.dynamic),
      '动态字段 '
    )
  }

  const validateCustomGroup = async (groupKey: string): Promise<boolean> => {
    return validateByFilter(
      option => option.layout?.group === groupKey,
      `自定义分组 ${groupKey} `
    )
  }

  // ================= 事件处理方法 =================

  // 🎯 关键修复：添加字段变化事件处理
  const handleFieldsChange = (fields: FormOption[]): void => {
    console.log('🎯 C_Form 收到字段变化事件，转发给父组件:', fields)
    emit('fields-change', fields)
  }

  const handleTabChange = (tabKey: string): void => emit('tab-change', tabKey)

  const handleStepChange = (stepIndex: number, stepKey: string): void =>
    emit('step-change', stepIndex, stepKey)

  const handleStepBeforeChange = async (
    currentStep: number,
    targetStep: number
  ): Promise<boolean> => {
    emit('step-before-change', currentStep, targetStep)
    return true
  }

  const handleStepValidate = async (stepIndex: number): Promise<boolean> => {
    try {
      const currentStepKey = props.layoutConfig?.steps?.steps?.[stepIndex]?.key
      if (!currentStepKey) return true

      const stepFields = props.options
        .filter(option => option.layout?.step === currentStepKey)
        .map(option => option.prop)

      if (stepFields.length === 0) return true

      await validateField(stepFields)
      emit('step-validate', stepIndex)
      return true
    } catch (error) {
      console.warn(`[C_Form] 步骤 ${stepIndex} 验证失败:`, error)
      return false
    }
  }

  const handleFieldAdd = (fieldConfig: DynamicFieldConfig): void =>
    emit('field-add', fieldConfig)

  const handleFieldRemove = (fieldId: string): void =>
    emit('field-remove', fieldId)

  const handleFieldToggle = (fieldId: string, visible: boolean): void =>
    emit('field-toggle', fieldId, visible)

  const handleFieldsClear = (): void => emit('fields-clear')

  const handleRenderModeChange = (mode: RenderMode): void =>
    emit('render-mode-change', mode)

  const handleGroupToggle = (groupKey: string, collapsed: boolean): void =>
    emit('group-toggle', groupKey, collapsed)

  const handleGroupReset = (groupKey: string): void =>
    emit('group-reset', groupKey)

  const handleSubmit = async (): Promise<void> => {
    try {
      await validate()
      emit('submit', { model: getModel(), form: formRef.value! })
    } catch (error) {
      console.warn('[C_Form] 表单验证失败:', error)
    }
  }

  const handleReset = (): void => {
    try {
      clearValidation()

      props.options.forEach(item => {
        const defaultValue =
          item.value !== undefined
            ? item.value
            : getDefaultValue(item.type as ComponentType)

        formModel[item.prop] = defaultValue
      })
    } catch (error) {
      console.error('[C_Form] 重置表单失败:', error)
    }
  }

  // ================= 对外API =================

  const resetFields = (): void => handleReset()

  const setFields = (fields: FormModel): void => {
    Object.assign(formModel, fields)
  }

  const getModel = (): FormModel => ({ ...formModel })

  const setFieldValue = async (
    field: string,
    value: any,
    shouldValidate: boolean = false
  ): Promise<void> => {
    formModel[field] = value
    if (shouldValidate) {
      await validateField(field)
    }
  }

  const getFieldValue = (field: string): any => formModel[field]

  const setFieldsValue = async (
    fields: FormModel,
    shouldValidate: boolean = false
  ): Promise<void> => {
    Object.assign(formModel, fields)
    if (shouldValidate) {
      await validate()
    }
  }

  // ================= 生命周期 =================

  onMounted(() => {
    initialize()

    watch(
      () => props.options,
      () => initialize(),
      { deep: true }
    )

    watch(
      () => props.modelValue,
      val => {
        if (val) Object.assign(formModel, val)
      },
      { immediate: true, deep: true }
    )

    watch(formModel, val => emit('update:modelValue', { ...val }), {
      deep: true,
    })
  })

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
    layoutType: toRef(props, 'layoutType'),
    shouldShowDefaultActions,
  })
</script>
