<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-09 23:29:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-09 23:36:11
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\GridLayout\index.vue
 * @Description: 表单组件 - 网格组件 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="grid-layout">
    <!-- 网格布局配置 -->
    <div class="grid-config">
      <NCard
        class="config-card"
        :bordered="false"
      >
        <template #header>
          <div class="config-header">
            <Icon
              icon="mdi:grid"
              class="header-icon"
            />
            <span>网格布局配置</span>
          </div>
        </template>
        <div class="config-controls">
          <div class="config-item">
            <label class="config-label">
              <Icon icon="mdi:view-column-outline" />
              栅格列数
            </label>
            <NSelect
              v-model:value="gridCols"
              :options="colsOptions"
              size="small"
              style="width: 100px"
            />
          </div>
          <div class="config-item">
            <label class="config-label">
              <Icon icon="mdi:arrow-expand-horizontal" />
              网格间距
              <span class="config-value">{{ gridGutter }}px</span>
            </label>
            <NSlider
              v-model:value="gridGutter"
              :min="8"
              :max="32"
              :step="4"
              :tooltip="false"
              style="width: 120px"
            />
          </div>
          <div class="config-item">
            <label class="config-label">
              <Icon icon="mdi:responsive" />
              响应式布局
            </label>
            <NSwitch v-model:value="responsive" />
          </div>
        </div>
      </NCard>
    </div>

    <!-- 网格预览 -->
    <div class="grid-preview">
      <div class="preview-title">网格预览 ({{ gridCols }}列系统)</div>
      <div
        class="grid-demo"
        :style="{ gap: `${gridGutter}px` }"
      >
        <div
          v-for="col in gridCols"
          :key="col"
          class="grid-col"
          :style="{
            width: `calc(${100 / gridCols}% - ${(gridGutter * (gridCols - 1)) / gridCols}px)`,
          }"
        >
          {{ col }}
        </div>
      </div>
    </div>

    <!-- 表单 -->
    <C_Form
      ref="formRef"
      :options="formOptions"
      :config="formConfig"
      v-model="formData"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
    >
      <template #action="{ validate, reset }">
        <C_ActionBar
          :actions="getFormActions(validate, reset)"
          :config="{ align: 'right', gap: 12 }"
        />
      </template>
    </C_Form>

    <!-- 布局预览模态框 -->
    <div
      v-if="showLayoutPreview"
      class="layout-preview-modal"
      @click="showLayoutPreview = false"
    >
      <div
        class="preview-content"
        @click.stop
      >
        <div class="preview-header">
          <h3>网格布局预览</h3>
          <button
            class="close-btn"
            @click="showLayoutPreview = false"
            >×</button
          >
        </div>
        <div class="preview-body">
          <div class="layout-info">
            <div
              v-for="info in layoutInfo"
              :key="info.label"
              class="info-item"
            >
              <span class="label">{{ info.label }}:</span>
              <span class="value">{{ info.value }}</span>
            </div>
          </div>
          <div class="field-layout-preview">
            <div
              v-for="option in formOptions"
              :key="option.prop"
              class="field-preview"
            >
              <div class="field-name">{{ option.label }}</div>
              <div class="field-span">
                占用: {{ option.layout?.span || 12 }} / {{ gridCols }} 列
              </div>
              <div class="field-width">
                宽度:
                {{
                  (((option.layout?.span || 12) / gridCols) * 100).toFixed(1)
                }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    LabelPlacement,
    FormInstance,
    FormModel,
    ActionItem,
  } from '@robot-admin/naive-ui-components'
  import { colsOptions, formOptions } from './data'

  // ==================== Props & Emits ====================

  interface Props {
    labelPlacement?: LabelPlacement
    validateOnChange?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    labelPlacement: 'left',
    validateOnChange: false,
  })

  const { labelPlacement, validateOnChange } = toRefs(props)

  const emit = defineEmits<{
    submit: [payload: any]
    'validate-success': [model: FormModel]
    'validate-error': [errors: any]
    'fields-change': [fields: any[]]
  }>()

  const formData = defineModel<FormModel>({ required: true })

  // ==================== 响应式状态 ====================

  const formRef = ref<FormInstance | null>(null)
  const submitLoading = ref(false)
  const showLayoutPreview = ref(false)
  const gridCols = ref(24)
  const gridGutter = ref(16)
  const responsive = ref(true)
  const message = useMessage()

  // ==================== 计算属性 ====================

  const formConfig = computed(() => ({
    layout: 'grid' as const,
    grid: {
      cols: gridCols.value,
      gutter: gridGutter.value,
    },
    validateOnChange: validateOnChange.value,
    labelPlacement: labelPlacement.value,
  }))

  // ==================== 表单操作按钮配置 ====================
  const getFormActions = (
    validate: () => Promise<void>,
    reset: () => void
  ): ActionItem[] => [
    {
      key: 'reset',
      label: '重置表单',
      icon: 'mdi:lock-reset',
      onClick: () => {
        reset()
        message.info('表单已重置')
      },
    },
    {
      key: 'preview',
      label: '预览布局',
      icon: 'mdi:eye-outline',
      type: 'success',
      onClick: () => {
        showLayoutPreview.value = true
      },
    },
    {
      key: 'submit',
      label: submitLoading.value ? '提交中...' : '提交表单',
      icon: 'mdi:check-circle-outline',
      type: 'primary',
      loading: submitLoading.value,
      onClick: async () => {
        try {
          submitLoading.value = true
          await validate()
          emit('submit', formData.value)
          message.success('网格布局表单提交成功！')
        } catch (error) {
          message.error('表单验证失败，请检查输入')
          throw error
        } finally {
          submitLoading.value = false
        }
      },
    },
  ]

  const layoutInfo = computed(() => [
    { label: '栅格系统', value: `${gridCols.value}列` },
    { label: '间距大小', value: `${gridGutter.value}px` },
    { label: '响应式', value: responsive.value ? '已启用' : '已禁用' },
  ])

  // ==================== 事件处理器 ====================

  const handleSubmit = (payload: any) => emit('submit', payload)
  const handleValidateSuccess = (model: FormModel) =>
    emit('validate-success', model)
  const handleValidateError = (errors: any) => emit('validate-error', errors)

  // ==================== 生命周期 ====================

  onMounted(() => {
    emit('fields-change', formOptions)
  })

  // ==================== 暴露的方法 ====================

  defineExpose({
    validate: () => formRef.value?.validate(),
    resetFields: () => formRef.value?.resetFields(),
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
