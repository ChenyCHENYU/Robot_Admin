<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-09 00:21:33
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:41:08
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\CardLayout\index.vue
 * @Description: 卡片布局表单演示 - 修复版本
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="card-demo-page">
    <!-- 表单组件 -->
    <C_Form
      ref="formRef"
      v-model="formData"
      :options="formOptions"
      layout-type="card"
      :layout-config="cardLayoutConfig"
      :validate-on-value-change="validateOnChange"
      :label-placement="labelPlacement"
      :show-default-actions="true"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
      @fields-change="handleFieldsChange"
    />

    <!-- 调试面板（开发模式） -->
    <NCard
      v-if="isDev"
      class="debug-panel mt-6"
      :title="DEBUG_CONFIG.title"
    >
      <NTabs>
        <NTabPane
          v-for="tab in DEBUG_TABS"
          :key="tab.name"
          :name="tab.name"
          :tab="tab.tab"
        >
          <pre
            v-if="tab.name === 'formData'"
            class="debug-code"
            >{{ JSON.stringify(formData, null, 2) }}</pre
          >
          <pre
            v-else-if="tab.name === 'options'"
            class="debug-code"
            >{{ JSON.stringify(formOptions, null, 2) }}</pre
          >
          <pre
            v-else-if="tab.name === 'layoutConfig'"
            class="debug-code"
            >{{ JSON.stringify(cardLayoutConfig, null, 2) }}</pre
          >
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormModel,
    FormInstance,
    LabelPlacement,
  } from '@/types/modules/form'
  import {
    FORM_OPTIONS,
    CARD_LAYOUT_CONFIG,
    DEMO_FORM_DATA,
    DEBUG_TABS,
    DEBUG_CONFIG,
    MESSAGES,
  } from './data'

  // ==================== Props ====================
  interface Props {
    labelPlacement?: LabelPlacement
    validateOnChange?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    labelPlacement: 'left',
    validateOnChange: false,
  })

  // ==================== Emits ====================
  const emit = defineEmits<{
    submit: [payload: any]
    'validate-success': [model: FormModel]
    'validate-error': [errors: any]
    'fields-change': [fields: any[]]
  }>()

  // ==================== v-model ====================
  const formData = defineModel<FormModel>({ required: true })

  // ==================== 响应式状态 ====================
  const formRef = ref<FormInstance | null>(null)
  const isDev = ref(import.meta.env.DEV && DEBUG_CONFIG.showInDev)

  const message = useMessage()

  // ==================== 表单配置 ====================
  const formOptions = ref(FORM_OPTIONS)
  const cardLayoutConfig = ref(CARD_LAYOUT_CONFIG)

  // ==================== 计算属性 ====================
  const { labelPlacement, validateOnChange } = toRefs(props)

  // ==================== 事件处理 ====================
  const handleSubmit = async (payload: any): Promise<void> => {
    console.log('表单提交:', payload)
    emit('submit', payload) // 🔥 关键：向父组件转发事件

    try {
      // 这里可以调用 API
      // await submitUserForm(payload.model)
      message.success(MESSAGES.submitSuccess)
    } catch (error) {
      console.error('提交失败:', error)
      message.error(MESSAGES.submitError)
    }
  }

  const handleValidateSuccess = (model: FormModel): void => {
    console.log('验证成功:', model)
    emit('validate-success', model) // 🔥 关键：向父组件转发事件
  }

  const handleValidateError = (errors: any): void => {
    console.error('验证失败:', errors)
    emit('validate-error', errors) // 🔥 关键：向父组件转发事件
  }

  const handleFieldsChange = (fields: any[]): void => {
    console.log('字段变化:', fields)
    emit('fields-change', fields) // 🔥 关键：向父组件转发事件
  }

  // ==================== 工具方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  const resetForm = (): void => {
    resetFields()
    message.info(MESSAGES.resetSuccess)
  }

  const setFormData = (data: FormModel): void => {
    Object.assign(formData.value, data)
  }

  // 加载示例数据的方法（可选择性使用）
  const loadDemoData = (): void => {
    setFormData(DEMO_FORM_DATA)
    message.info('已加载示例数据')
  }

  // ==================== 初始化 ====================
  onMounted(() => {
    // 🔥 关键：主动触发fields-change事件
    emit('fields-change', formOptions.value)
    console.log('卡片布局表单组件已加载')
  })

  // ==================== 暴露方法 ====================
  defineExpose({
    validate, // 🔥 关键：暴露验证方法
    resetFields, // 🔥 关键：暴露重置方法
    resetForm,
    setFormData,
    loadDemoData,
    formRef,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
