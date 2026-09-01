<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-10 00:12:40
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:20:33
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\DefaultLayout\index.vue
 * @Description: 表单组件 - 默认布局  - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="default-layout">
    <C_Form
      ref="formRef"
      :options="formOptions"
      :config="formConfig"
      v-model="formData"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
    >
      <!-- 自定义表单操作区 -->
      <template #action="{ submit, reset }">
        <C_ActionBar
          :actions="getFormActions(submit, reset)"
          :config="{ align: 'right', gap: 16 }"
        />
      </template>
    </C_Form>
  </div>
</template>

<script setup lang="ts">
  import '@robot-admin/naive-ui-components/C_Editor/style.css'
  import type {
    LabelPlacement,
    FormInstance,
    FormOption,
    FormConfig,
    SubmitEventPayload,
    ActionItem,
  } from '@robot-admin/naive-ui-components'
  import { formOptions, FORM_MESSAGES, type DefaultFormData } from './data'

  // ==================== Props ====================
  interface Props {
    labelPlacement?: LabelPlacement
    validateOnChange?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    labelPlacement: 'left',
    validateOnChange: false,
  })

  const { labelPlacement, validateOnChange } = toRefs(props)

  // ==================== Emits ====================
  const emit = defineEmits<{
    submit: [payload: SubmitEventPayload<DefaultFormData>]
    'validate-success': [model: DefaultFormData]
    'validate-error': [errors: unknown]
    'fields-change': [fields: FormOption<DefaultFormData>[]]
  }>()

  // ==================== v-model ====================
  const formData = defineModel<DefaultFormData>({ required: true })

  // ==================== 响应式状态 ====================
  const formRef = ref<FormInstance<DefaultFormData> | null>(null)
  const submitLoading = ref<boolean>(false)
  const message = useMessage()

  // ==================== 计算属性 ====================
  const formConfig = computed<FormConfig<DefaultFormData>>(() => ({
    layout: 'default' as const,
    validateOnChange: validateOnChange.value,
    labelPlacement: labelPlacement.value,
    onFieldsChange: handleFieldsChange,
  }))

  // ==================== 事件处理 ====================
  const handleFieldsChange = (fields: FormOption<DefaultFormData>[]): void => {
    emit('fields-change', fields)
  }

  // ==================== 表单操作按钮配置 ====================
  const getFormActions = (
    submit: () => Promise<boolean>,
    reset: () => void
  ): ActionItem[] => [
    {
      key: 'reset',
      label: '重置表单',
      onClick: () => resetForm(reset),
    },
    {
      key: 'submit',
      label: submitLoading.value
        ? FORM_MESSAGES.SUBMITTING
        : FORM_MESSAGES.SUBMIT_TEXT,
      type: 'primary',
      loading: submitLoading.value,
      onClick: () => submitForm(submit),
    },
  ]

  // ==================== 表单操作方法 ====================
  const submitForm = async (submit: () => Promise<boolean>): Promise<void> => {
    try {
      submitLoading.value = true
      const isValid = await submit()
      if (isValid) message.success(FORM_MESSAGES.SUBMIT_SUCCESS)
    } catch (errors) {
      message.error(FORM_MESSAGES.VALIDATE_ERROR)
      console.log('表单验证失败:', errors)
    } finally {
      submitLoading.value = false
    }
  }

  const resetForm = (reset: () => void): void => {
    reset()
    message.info(FORM_MESSAGES.RESET_INFO)
  }

  // ==================== 事件处理器 ====================
  const handleSubmit = (payload: SubmitEventPayload<DefaultFormData>): void => {
    emit('submit', payload)
  }

  const handleValidateSuccess = (model: DefaultFormData): void => {
    emit('validate-success', model)
  }

  const handleValidateError = (errors: unknown): void => {
    emit('validate-error', errors)
  }

  // ==================== 暴露的方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  defineExpose({
    validate,
    resetFields,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
