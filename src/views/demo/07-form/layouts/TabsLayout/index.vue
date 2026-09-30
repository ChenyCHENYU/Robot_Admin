<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-08 22:08:36
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:43:15
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\TabsLayout\index.vue
 * @Description: 表单标签布局 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="tabs-demo">
    <!-- 配置面板 -->
    <NCard
      title="标签页表单配置"
      size="small"
      class="mb-6"
    >
      <NSpace vertical>
        <NSpace align="center">
          <NCheckbox v-model:checked="layoutConfig.tabs.validateBeforeSwitch">
            切换前验证
          </NCheckbox>
          <NCheckbox v-model:checked="layoutConfig.tabs.showTabHeader">
            显示标签描述
          </NCheckbox>
          <NCheckbox v-model:checked="layoutConfig.tabs.showActions">
            显示操作按钮
          </NCheckbox>
          <NCheckbox v-model:checked="layoutConfig.tabs.showCount">
            显示计数徽章
          </NCheckbox>
          <NCheckbox v-model:checked="layoutConfig.tabs.animated">
            启用动画
          </NCheckbox>
        </NSpace>

        <NSpace align="center">
          <div class="config-item">
            <span class="config-label">标签类型：</span>
            <NRadioGroup v-model:value="layoutConfig.tabs.type">
              <NRadio value="line">线条</NRadio>
              <NRadio value="card">卡片</NRadio>
              <NRadio value="segment">分段</NRadio>
            </NRadioGroup>
          </div>

          <div class="config-item">
            <span class="config-label">标签大小：</span>
            <NRadioGroup v-model:value="layoutConfig.tabs.size">
              <NRadio value="small">小</NRadio>
              <NRadio value="medium">中</NRadio>
              <NRadio value="large">大</NRadio>
            </NRadioGroup>
          </div>

          <div class="config-item">
            <span class="config-label">标签位置：</span>
            <NSelect
              v-model:value="layoutConfig.tabs.placement"
              :options="placementOptions"
              style="width: 120px"
            />
          </div>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 标签页表单 -->
    <C_Form
      ref="formRef"
      v-model="formData"
      :options="formOptions"
      :config="formConfig"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
    >
      <template #tab-actions="{ validateTab, currentTab }">
        <C_ActionBar
          :actions="getTabActions(validateTab, currentTab)"
          :config="{ compact: true }"
        />
      </template>
      <template #action="{ validate, reset }">
        <C_ActionBar
          :actions="getFormActions(validate, reset)"
          :config="{ gap: 12 }"
        />
      </template>
    </C_Form>

    <!-- 表单数据预览 -->
    <NCard
      title="表单数据"
      size="small"
      class="mt-6"
    >
      <NCode
        :code="JSON.stringify(formData, null, 2)"
        language="json"
      />
    </NCard>

    <!-- 操作按钮 -->
    <NCard
      title="操作"
      size="small"
      class="mt-4"
    >
      <C_ActionBar
        :actions="actionButtons"
        :config="{ gap: 12 }"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo07FormTabsLayout' })
  import type {
    FormModel,
    FormOption,
    FormInstance,
    LabelPlacement,
    ActionItem,
  } from '@robot-admin/naive-ui-components'
  import { layoutConfig, placementOptions, createFormOptions } from './data'

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
    submit: [payload: { model: FormModel }]
    'validate-success': [model: FormModel]
    'validate-error': [errors: unknown]
    'fields-change': [fields: FormOption[]]
  }>()

  // ==================== v-model ====================
  const formData = defineModel<FormModel>({ required: true })

  // ================= 状态管理 =================
  const message = useMessage()
  const formRef = ref<FormInstance>()
  let draftSnapshot: string | null = null

  // ================= 计算属性 =================
  const formOptions = computed(() => createFormOptions())
  const { labelPlacement, validateOnChange } = toRefs(props)

  const formConfig = computed(() => ({
    layout: 'tabs' as const,
    tabs: layoutConfig.tabs,
    labelPlacement: labelPlacement.value,
    validateOnChange: validateOnChange.value,
    onTabValidate: handleTabValidate,
    onFieldsChange: handleFieldsChange,
  }))

  // ==================== 表单操作按钮配置 ====================
  const getFormActions = (
    validate: () => Promise<void>,
    reset: () => void
  ): ActionItem[] => [
    {
      key: 'submit',
      label: '提交',
      icon: 'mdi:check-circle-outline',
      type: 'primary',
      onClick: async () => {
        try {
          await validate()
        } catch {
          message.error('表单验证失败')
        }
      },
    },
    {
      key: 'reset',
      label: '重置',
      icon: 'mdi:lock-reset',
      onClick: () => {
        reset()
        message.info('表单已重置')
      },
    },
  ]

  // ==================== 标签页验证按钮配置 ====================
  const getTabActions = (
    validateTab: () => void,
    currentTab: string
  ): ActionItem[] => [
    {
      key: 'validateTab',
      label: `验证 ${getTabTitle(currentTab)}`,
      icon: 'mdi:task-auto',
      type: 'primary',
      size: 'small',
      onClick: validateTab,
    },
  ]

  // ==================== 操作按钮配置 ====================
  const actionButtons = computed<ActionItem[]>(() => [
    {
      key: 'saveDraft',
      label: '保存草稿',
      icon: 'mdi:content-save',
      onClick: handleSaveDraft,
    },
    {
      key: 'loadDraft',
      label: '加载草稿',
      icon: 'mdi:folder-open-outline',
      onClick: handleLoadDraft,
    },
    {
      key: 'reset',
      label: '重置表单',
      icon: 'mdi:lock-reset',
      onClick: handleReset,
    },
    {
      key: 'export',
      label: '导出数据',
      icon: 'mdi:download-multiple-outline',
      type: 'warning',
      onClick: handleExportData,
    },
  ])

  // ================= 工具方法 =================
  const getTabTitle = (tabKey: string): string => {
    const tab = layoutConfig.tabs.tabs.find(t => t.key === tabKey)
    return tab?.title || tabKey
  }

  // ================= 事件处理 =================
  const handleTabValidate = (tabKey: string): boolean => {
    message.info(`正在验证 ${getTabTitle(tabKey)}`)
    return true
  }

  const handleValidateSuccess = (model: FormModel) => {
    emit('validate-success', model)
    message.success('表单验证通过')
  }

  const handleValidateError = (errors: unknown) => {
    emit('validate-error', errors)
    message.error('表单验证失败')
  }

  const handleSubmit = (payload: { model: FormModel }) => {
    emit('submit', payload)
  }

  const handleFieldsChange = (fields: FormOption[]): void => {
    emit('fields-change', fields)
  }

  const handleSaveDraft = () => {
    try {
      draftSnapshot = JSON.stringify(formData.value)
      message.success('草稿已保存到当前页面')
    } catch {
      message.error('草稿保存失败')
    }
  }

  const handleLoadDraft = () => {
    if (!draftSnapshot) {
      message.warning('请先保存草稿')
      return
    }
    try {
      formData.value = JSON.parse(draftSnapshot) as FormModel
      message.success('草稿已加载')
    } catch {
      message.error('草稿加载失败')
    }
  }

  const handleReset = () => {
    if (formRef.value?.resetFields) {
      formRef.value.resetFields()
    }
    formData.value = {}
    message.info('表单已重置')
  }

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(formData.value, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'form-data.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success('数据导出成功')
    } catch (error) {
      message.error('数据导出失败')
      console.error('数据导出失败:', error)
    }
  }

  // ==================== 工具方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  // ==================== 暴露方法 ====================
  defineExpose({
    validate, // 🔥 关键：暴露验证方法
    resetFields, // 🔥 关键：暴露重置方法
    formRef,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
