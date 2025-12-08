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
      layout-type="tabs"
      :layout-config="layoutConfig"
      :label-placement="labelPlacement"
      :validate-on-value-change="validateOnChange"
      @tab-change="handleTabChange"
      @tab-validate="handleTabValidate"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
      @fields-change="handleFieldsChange"
    >
      <template #tab-actions="{ validateTab, currentTab }">
        <NButton
          type="primary"
          size="small"
          @click="validateTab"
        >
          <div class="i-mdi:task-auto mr-1" />
          验证 {{ getTabTitle(currentTab) }}
        </NButton>
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
      <NSpace>
        <NButton
          type="default"
          @click="handleSaveDraft"
        >
          <div class="i-mdi:content-save mr-1" />
          保存草稿
        </NButton>

        <NButton
          type="default"
          @click="handleLoadDraft"
        >
          <div class="i-mdi:folder-open-outline mr-1" />
          加载草稿
        </NButton>

        <NButton
          type="default"
          @click="handleReset"
        >
          <div class="i-mdi:lock-reset mr-1" />
          重置表单
        </NButton>

        <NButton
          type="warning"
          @click="handleExportData"
        >
          <div class="i-mdi:download-multiple-outline mr-1" />
          导出数据
        </NButton>
      </NSpace>
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
    layoutConfig,
    placementOptions,
    createFormOptions,
    mockDraftData,
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

  // ================= 状态管理 =================
  const message = useMessage()
  const formRef = ref<FormInstance>()

  // ================= 计算属性 =================
  const formOptions = computed(() => createFormOptions(() => formData.value))
  const { labelPlacement, validateOnChange } = toRefs(props)

  // ================= 工具方法 =================
  const getTabTitle = (tabKey: string): string => {
    const tab = layoutConfig.tabs.tabs.find(t => t.key === tabKey)
    return tab?.title || tabKey
  }

  // ================= 事件处理 =================
  const handleTabChange = (tabKey: string) => {
    const tabIndex = layoutConfig.tabs.tabs.findIndex(t => t.key === tabKey)
    console.log(`切换到标签页: ${getTabTitle(tabKey)}`, `索引: ${tabIndex}`)
  }

  const handleTabValidate = (tabKey: string): boolean => {
    console.log(`验证标签页: ${getTabTitle(tabKey)}`)
    message.info(`正在验证 ${getTabTitle(tabKey)}`)
    return true
  }

  const handleValidateSuccess = (model: FormModel) => {
    console.log('表单验证成功', model)
    emit('validate-success', model) // 🔥 关键：向父组件转发事件
    message.success('表单验证通过')
  }

  const handleValidateError = (errors: unknown) => {
    console.log('表单验证失败', errors)
    emit('validate-error', errors) // 🔥 关键：向父组件转发事件
    message.error('表单验证失败')
  }

  const handleSubmit = (payload: { model: FormModel }) => {
    console.log('提交的数据:', payload.model)
    emit('submit', payload) // 🔥 关键：向父组件转发事件
    message.success('表单提交成功！')
  }

  const handleFieldsChange = (fields: any[]): void => {
    console.log('字段变化:', fields)
    emit('fields-change', fields) // 🔥 关键：向父组件转发事件
  }

  const handleSaveDraft = () => {
    try {
      const draftData = JSON.stringify(formData.value)
      // 由于在浏览器artifact环境中不能使用localStorage，这里模拟保存操作
      console.log('模拟保存草稿:', draftData)
      message.success('草稿已保存')
    } catch (error) {
      message.error('草稿保存失败')
      console.error('草稿保存失败:', error)
    }
  }

  const handleLoadDraft = () => {
    try {
      Object.assign(formData.value, mockDraftData)
      message.success('草稿已加载')
    } catch (error) {
      message.error('草稿加载失败')
      console.error('草稿加载失败:', error)
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

  // ==================== 初始化 ====================
  onMounted(() => {
    // 🔥 关键：主动触发fields-change事件
    emit('fields-change', formOptions.value)
    console.log('标签页布局表单组件已加载')
  })

  // 监听formOptions变化，重新发送字段信息
  watch(
    formOptions,
    newOptions => {
      emit('fields-change', newOptions)
    },
    { deep: true }
  )

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
