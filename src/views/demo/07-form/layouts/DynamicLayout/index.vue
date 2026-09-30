<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 20:10:11
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:48:50
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\DynamicLayout\index.vue
 * @Description: 动态组件 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="demo-page">
    <!-- 动态表单 -->
    <div class="form-section">
      <NCard size="medium">
        <C_Form
          ref="formRef"
          v-model="formData"
          :options="allFields"
          :config="cFormConfig"
          @submit="handleSubmit"
          @validate-success="handleValidateSuccess"
          @validate-error="handleValidateError"
        >
          <!-- 自定义操作按钮 -->
          <template #action="{ validate, reset }">
            <C_ActionBar
              :actions="getFormActions(validate, reset)"
              :config="{ align: 'center', gap: 12 }"
            />
          </template>
        </C_Form>
      </NCard>
    </div>

    <!-- 数据预览 -->
    <div
      v-if="showPreview"
      class="preview-section"
    >
      <NCard
        title="数据预览"
        size="small"
      >
        <template #header-extra>
          <NButton
            size="small"
            @click="showPreview = false"
          >
            <template #icon>
              <div class="i-mdi-close"></div>
            </template>
          </NButton>
        </template>

        <NTabs
          type="line"
          animated
        >
          <NTabPane
            v-for="tab in PREVIEW_TABS"
            :key="tab.name"
            :name="tab.name"
            :tab="tab.tab"
          >
            <div class="json-preview">
              <pre>{{ getPreviewData(tab.name) }}</pre>
            </div>
          </NTabPane>
        </NTabs>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo07FormDynamicLayout' })
  import {
    useDynamicFormState,
    DYNAMIC_FORM_STATE_KEY,
    type FormModel,
    type FormOption,
    type FormInstance,
    type LabelPlacement,
    type DynamicFormConfig,
  } from '@robot-admin/naive-ui-components/C_Form'
  import type { ActionItem } from '@robot-admin/naive-ui-components'
  import {
    DYNAMIC_FORM_CONFIG,
    BASE_FORM_OPTIONS,
    createLayoutConfig,
    createConfigSnapshot,
    createFieldStats,
    createFormState,
    formatFieldsForPreview,
    FORM_ACTIONS,
    PREVIEW_TABS,
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
    submit: [payload: { model: FormModel }]
    'validate-success': [model: FormModel]
    'validate-error': [errors: unknown]
    'fields-change': [fields: FormOption[]]
  }>()

  // ==================== v-model ====================
  const formData = defineModel<FormModel>({ required: true })

  // ================= 页面状态 =================
  const formRef = ref<FormInstance>()
  const message = useMessage()
  const submitLoading = ref(false)
  const showPreview = ref(false)

  // 动态表单配置（使用响应式对象以支持运行时修改）
  const formConfig = reactive<DynamicFormConfig>({ ...DYNAMIC_FORM_CONFIG })

  // ================= 动态表单状态管理 =================
  const dynamicState = useDynamicFormState()

  // 通过 provide 提供状态给 C_Form 及其子组件
  provide(DYNAMIC_FORM_STATE_KEY, dynamicState)

  // 解构状态
  const { allFields, visibleFields, dynamicFieldsCount, hiddenFieldsCount } =
    dynamicState

  // ================= 计算属性 =================
  const layoutConfig = computed(() => createLayoutConfig(formConfig))
  const { labelPlacement, validateOnChange } = toRefs(props)

  const cFormConfig = computed(() => ({
    layout: 'dynamic' as const,
    dynamic: layoutConfig.value.dynamic,
    labelPlacement: labelPlacement.value,
    validateOnChange: validateOnChange.value,
  }))

  // ================= 表单操作按钮配置 =================
  const getFormActions = (
    validate: () => Promise<void>,
    reset: () => void
  ): ActionItem[] => [
    {
      key: 'reset',
      label: FORM_ACTIONS.reset.text,
      icon: FORM_ACTIONS.reset.icon,
      onClick: reset,
    },
    {
      key: 'submit',
      label: FORM_ACTIONS.submit.getText(submitLoading.value),
      icon: FORM_ACTIONS.submit.icon,
      type: FORM_ACTIONS.submit.type as 'primary',
      loading: submitLoading.value,
      onClick: () => submitWithValidation(validate),
    },
    {
      key: 'preview',
      label: FORM_ACTIONS.preview.text,
      icon: FORM_ACTIONS.preview.icon,
      onClick: previewData,
    },
  ]

  const dynamicConfigSnapshot = computed(() => {
    // 创建字段统计数据
    const fieldStats = createFieldStats(
      allFields.value.length,
      BASE_FORM_OPTIONS.length,
      dynamicFieldsCount.value,
      visibleFields.value.length,
      hiddenFieldsCount.value
    )

    // 创建表单状态数据
    const formState = createFormState(
      formConfig,
      dynamicState.state.isInitialized
    )

    // 生成配置快照
    return createConfigSnapshot(fieldStats, formState)
  })

  // ================= 预览数据获取 =================
  const getPreviewData = (tabName: string): string => {
    switch (tabName) {
      case 'formData':
        return JSON.stringify(formData.value, null, 2)
      case 'config':
        return JSON.stringify(dynamicConfigSnapshot.value, null, 2)
      case 'allFields':
        return JSON.stringify(formatFieldsForPreview(allFields.value), null, 2)
      default:
        return '{}'
    }
  }

  // ================= 工具方法 =================
  const previewData = () => {
    showPreview.value = true
  }

  const submitWithValidation = async (validate: () => Promise<void>) => {
    if (submitLoading.value) return
    try {
      submitLoading.value = true
      await validate()
      emit('submit', { model: formData.value })
    } catch {
      message.error('请检查动态表单中的必填字段')
    } finally {
      submitLoading.value = false
    }
  }

  // ================= 事件处理方法 =================
  const handleSubmit = (payload: { model: FormModel }) =>
    emit('submit', payload)

  const handleValidateSuccess = (model: FormModel) =>
    emit('validate-success', model)

  const handleValidateError = (errors: unknown) =>
    emit('validate-error', errors)

  // ==================== 工具方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  // ================= 监听配置变化 =================
  watch(
    formConfig,
    newConfig => {
      dynamicState.updateConfig(newConfig)
    },
    { deep: true }
  )

  // 监听allFields变化，重新发送字段信息
  watch(
    allFields,
    newFields => {
      emit('fields-change', newFields)
    },
    { deep: true, immediate: true }
  )

  // ================= 生命周期 =================
  onMounted(() => {
    // 初始化动态表单状态
    dynamicState.initialize(BASE_FORM_OPTIONS, formConfig)
  })

  // ================= 对外暴露 =================
  defineExpose({
    validate, // 🔥 关键：暴露验证方法
    resetFields, // 🔥 关键：暴露重置方法
    formData,
    formConfig,
    dynamicState,
    previewData,
    submitWithValidation,
    formRef,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
