<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-10 00:12:40
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:20:33
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\07-form\\components\\DefaultLayout\\index.vue
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
      @submit="emit('submit', $event)"
      @validate-success="emit('validate-success', $event)"
      @validate-error="emit('validate-error', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo07FormDefaultLayout' })
  import '@robot-admin/naive-ui-components/C_Editor/style.css'
  import type {
    LabelPlacement,
    FormInstance,
    FormOption,
    FormConfig,
    SubmitEventPayload,
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

  // ==================== 计算属性 ====================
  const formConfig = computed<FormConfig<DefaultFormData>>(() => ({
    layout: 'default' as const,
    validateOnChange: validateOnChange.value,
    labelPlacement: labelPlacement.value,
    submitText: FORM_MESSAGES.SUBMIT_TEXT,
    resetText: FORM_MESSAGES.RESET_TEXT,
    resetSuccessText: FORM_MESSAGES.RESET_INFO,
  }))

  // ==================== 事件处理器 ====================
  // ==================== 暴露的方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  onMounted(() => {
    emit('fields-change', formOptions)
  })

  defineExpose({
    validate,
    resetFields,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
