<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 16:24:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:50:36
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\CustomLayout\index.vue
 * @Description: 自定义布局演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="custom-layout-demo">
    <!-- 使用自定义布局组件 -->
    <C_Form
      ref="formRef"
      :options="employeeFormOptions"
      :config="{
        layout: 'custom',
        labelPlacement: props.labelPlacement,
        validateOnChange: props.validateOnChange,
        showActions: false,
        onFieldsChange: handleFieldsChange,
      }"
      v-model="formData"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
      @update:modelValue="handleFormDataUpdate"
      @submit="handleSubmit"
    />

    <!-- 操作区域 -->
    <NCard
      title="🔧 演示操作"
      class="demo-actions"
    >
      <template #header-extra>
        <NSpace size="small">
          <NTag
            size="small"
            :type="actualFields.length > 0 ? 'success' : 'default'"
          >
            字段: {{ actualFields.length }}
          </NTag>
          <NTag
            size="small"
            :type="hasFormData ? 'success' : 'default'"
          >
            数据: {{ hasFormData ? '有' : '无' }}
          </NTag>
          <NButton
            size="tiny"
            @click="debugFormState"
            secondary
            type="info"
          >
            🔍 调试状态
          </NButton>
        </NSpace>
      </template>
      <C_ActionBar :actions="demoActions" />
    </NCard>

    <!-- 实时数据预览 -->
    <NCard
      title="📊 实时数据预览"
      class="demo-preview"
      v-if="hasFormFields"
    >
      <NTabs
        type="segment"
        v-if="hasFormData || Object.keys(validFormData).length > 0"
      >
        <NTabPane
          name="current"
          tab="当前数据"
        >
          <pre class="json-display">{{
            JSON.stringify(validFormData, null, 2)
          }}</pre>
        </NTabPane>
        <NTabPane
          name="raw"
          tab="原始数据"
        >
          <pre class="json-display">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </NTabPane>
        <NTabPane
          name="fields"
          tab="字段状态"
        >
          <NSpace
            vertical
            size="small"
          >
            <div
              ><strong>实际字段 ({{ actualFields.length }}个):</strong></div
            >
            <NTag
              v-for="field in actualFields"
              :key="field.prop"
              :type="hasFieldValue(field.prop) ? 'success' : 'default'"
              size="small"
            >
              {{ field.label || field.prop }}
              {{ hasFieldValue(field.prop) ? '✓' : '○' }}
            </NTag>
          </NSpace>
        </NTabPane>
      </NTabs>

      <NEmpty
        v-else
        description="暂无表单数据"
        size="small"
      >
        <template #extra>
          <NButton
            @click="fillTestData"
            size="small"
            type="primary"
          >
            填充测试数据
          </NButton>
        </template>
      </NEmpty>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormOption,
    FormInstance,
    FormModel,
    LabelPlacement,
  } from '@/types/modules/form'
  import type { ActionItem } from '@/types/modules/action-bar'
  import { useFormSubmit } from '@/hooks/useFormSubmit'
  import { useDebounceFn } from '@vueuse/core'
  import {
    type EmployeeFormData,
    employeeFormOptions,
    generateTestData,
    submitEmployeeAPI,
  } from './data'

  // ==================== Props ====================
  interface Props {
    labelPlacement?: LabelPlacement
    validateOnChange?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    labelPlacement: 'top',
    validateOnChange: true,
  })

  // ==================== Emits ====================
  const emit = defineEmits<{
    submit: [payload: any]
    'validate-success': [model: FormModel]
    'validate-error': [errors: any]
    'fields-change': [fields: any[]]
  }>()

  // ==================== v-model ====================
  const formData = defineModel<EmployeeFormData>({ required: true })

  // 响应式状态
  const formRef = ref<FormInstance>()
  const message = useMessage()
  const actualFields = ref<FormOption[]>([])

  // ================= 计算属性 =================

  // 防抖处理字段变化
  const debouncedHandleFieldsChange = useDebounceFn((fields: FormOption[]) => {
    actualFields.value = fields
    emit('fields-change', fields) // 🔥 关键：向父组件转发事件
    if (fields.length > 0) {
      message.info(`字段更新: ${fields.length} 个字段`)
    }
  }, 200)

  // 事件处理
  const handleFieldsChange = (fields: FormOption[]): void => {
    debouncedHandleFieldsChange(fields)
  }

  const handleFormDataUpdate = (data: EmployeeFormData): void => {
    Object.assign(formData.value, data)
  }

  const handleValidateSuccess = (model: FormModel): void => {
    console.log('表单验证成功:', model)
    emit('validate-success', model) // 🔥 关键：向父组件转发事件
    message.success('表单验证通过')
  }

  const handleValidateError = (errors: any): void => {
    console.error('表单验证失败:', errors)
    emit('validate-error', errors) // 🔥 关键：向父组件转发事件
    message.error('表单验证失败，请检查填写内容')
  }

  const handleSubmit = (payload: any): void => {
    console.log('表单提交:', payload)
    emit('submit', payload) // 🔥 关键：向父组件转发事件
  }

  // 获取当前表单数据的统一方法
  const getCurrentFormData = (): EmployeeFormData => {
    if (
      formRef.value?.getModel &&
      typeof formRef.value.getModel === 'function'
    ) {
      const formModel = formRef.value.getModel()
      if (formModel && Object.keys(formModel).length > 0) {
        return formModel
      }
    }
    return formData.value
  }

  // 检查字段是否有有效值
  const hasFieldValue = (fieldProp: string): boolean => {
    const currentData = getCurrentFormData()
    const value = currentData[fieldProp as keyof EmployeeFormData]
    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }

  // 计算属性
  const hasFormFields = computed(() => actualFields.value.length > 0)

  const hasFormData = computed(() => {
    if (!hasFormFields.value) return false
    const currentData = getCurrentFormData()
    return Object.values(currentData).some(
      value =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    )
  })

  const validFormData = computed(() => {
    const validData: EmployeeFormData = {}
    if (!hasFormFields.value) return validData

    const currentData = getCurrentFormData()
    actualFields.value.forEach(field => {
      if (
        field.prop in currentData &&
        currentData[field.prop as keyof EmployeeFormData] !== undefined
      ) {
        validData[field.prop as keyof EmployeeFormData] =
          currentData[field.prop as keyof EmployeeFormData]
      }
    })

    return validData
  })

  // ==================== 演示操作按钮配置 ====================
  const demoActions = computed<ActionItem[]>(() => [
    {
      key: 'fill',
      label: '🔄 填充测试数据',
      type: 'primary',
      buttonProps: { secondary: true },
      onClick: fillTestData,
    },
    {
      key: 'clear',
      label: '🗑️ 清空表单',
      buttonProps: { secondary: true },
      disabled: !hasFormFields.value,
      onClick: clearFormData,
    },
    {
      key: 'validate',
      label: '✅ 验证表单',
      type: 'success',
      buttonProps: { secondary: true },
      disabled: !hasFormFields.value,
      onClick: validateForm,
    },
    {
      key: 'submit',
      label: '🚀 提交表单',
      type: 'primary',
      loading: submitLoading.value,
      disabled: !hasFormFields.value || !hasFormData.value,
      onClick: submitForm,
    },
    {
      key: 'export',
      label: '📤 导出数据',
      buttonProps: { secondary: true },
      disabled: !hasFormFields.value,
      onClick: exportFormData,
    },
  ])

  // 提交配置
  const { loading: submitLoading, createSubmit } = useFormSubmit()
  const handleFormSubmit = createSubmit(submitEmployeeAPI, {
    successCode: '0',
    successMsg: '🎉 员工信息提交成功！',
  })

  // 操作函数
  const debugFormState = (): void => {
    const stats = {
      fields: actualFields.value.length,
      data: Object.keys(validFormData.value).length,
      formRef: !!formRef.value,
    }
    console.log('🔍 表单状态:', stats)
    message.info(`字段: ${stats.fields}个，数据: ${stats.data}个`)
  }

  const fillTestData = (): void => {
    if (!hasFormFields.value) {
      message.warning('请先在设计模式中添加字段')
      return
    }

    const newData = generateTestData(actualFields.value)
    if (Object.keys(newData).length === 0) {
      message.warning('没有找到可填充的字段')
      return
    }

    if (formRef.value?.setFieldsValue) {
      formRef.value.setFieldsValue(newData)
    } else {
      Object.assign(formData.value, newData)
    }

    setTimeout(() => {
      message.success(`已为 ${Object.keys(newData).length} 个字段填充测试数据`)
    }, 300)
  }

  const clearFormData = (): void => {
    if (!hasFormFields.value) {
      message.warning('请先在设计模式中添加字段')
      return
    }

    formData.value = {}
    if (formRef.value?.resetFields) {
      formRef.value.resetFields()
    }
    message.info('表单已清空')
  }

  const validateForm = async (): Promise<void> => {
    if (!formRef.value || !hasFormFields.value) {
      message.warning('表单不可用或无字段')
      return
    }

    try {
      await formRef.value.validate()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const submitForm = async (): Promise<void> => {
    if (!formRef.value || !hasFormFields.value) {
      message.warning('表单不可用或无字段')
      return
    }

    const dataToSubmit = validFormData.value
    if (Object.keys(dataToSubmit).length === 0) {
      message.warning('没有可提交的数据')
      return
    }

    const formScope = {
      form: formRef.value,
      model: dataToSubmit,
    }

    await handleFormSubmit(formScope)
  }

  const exportFormData = (): void => {
    if (!hasFormFields.value) {
      message.warning('请先在设计模式中添加字段')
      return
    }

    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        fieldCount: actualFields.value.length,
        configuredFields: actualFields.value.map(f => ({
          prop: f.prop,
          label: f.label,
          type: f.type,
        })),
      },
      data: validFormData.value,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employee-data-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success(
      `已导出 ${actualFields.value.length} 个字段的数据 ${Object.keys(validFormData.value).length > 0 ? '(含数据)' : '(仅结构)'}`
    )
  }

  // ==================== 工具方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  // ==================== 初始化 ====================
  onMounted(() => {
    // 🔥 关键：主动触发fields-change事件
    emit('fields-change', employeeFormOptions)
    console.log('自定义布局表单组件已加载')
  })

  // ==================== 暴露方法 ====================
  defineExpose({
    validate, // 🔥 关键：暴露验证方法
    resetFields, // 🔥 关键：暴露重置方法
    formRef,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
