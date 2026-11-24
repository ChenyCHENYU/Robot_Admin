<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 16:24:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:48:21
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\07-form\\components\\StepsLayout\\index.vue
 * @Description: 表单步骤布局 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="steps-demo">
    <!-- 配置面板 -->
    <NCard
      title="步骤表单配置"
      size="small"
      class="mb-6"
    >
      <NSpace align="center">
        <NCheckbox v-model:checked="layoutConfig.steps.vertical"
          >垂直布局</NCheckbox
        >
        <NCheckbox v-model:checked="layoutConfig.steps.validateBeforeNext"
          >验证后继续</NCheckbox
        >
        <NCheckbox v-model:checked="layoutConfig.steps.showStepHeader"
          >显示步骤标题</NCheckbox
        >

        <!-- 改为单选按钮组 -->
        <div class="size-selector">
          <span class="size-label">步骤大小：</span>
          <NRadioGroup v-model:value="layoutConfig.steps.size">
            <NRadio value="small">小</NRadio>
            <NRadio value="medium">中</NRadio>
          </NRadioGroup>
        </div>
      </NSpace>
    </NCard>

    <!-- 步骤表单 -->
    <C_Form
      ref="formRef"
      v-model="formData"
      :options="formOptions"
      :config="formConfig"
      @submit="emit('submit', $event)"
      @validate-success="emit('validate-success', $event)"
      @validate-error="emit('validate-error', $event)"
    />

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
    <div class="action-buttons">
      <C_ActionBar
        :actions="actionButtons"
        :config="{ gap: 12 }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo07FormStepsLayout' })
  import type {
    FormModel,
    FormOption,
    FormInstance,
    LabelPlacement,
    ActionItem,
  } from '@robot-admin/naive-ui-components'
  import { getLayoutConfig, getFormOptions } from './data'
  import { useLayoutDraft } from '../../useLayoutDraft'

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
  const { saveDraft, loadDraft } = useLayoutDraft(formData)

  // ================= 配置数据 =================
  const layoutConfig = reactive(getLayoutConfig())

  // ================= 表单字段配置 =================
  const formOptions = getFormOptions()
  const { labelPlacement, validateOnChange } = toRefs(props)

  const formConfig = computed(() => ({
    layout: 'steps' as const,
    steps: layoutConfig.steps,
    labelPlacement: labelPlacement.value,
    labelWidth: 120,
    validateOnChange: validateOnChange.value,
    submitText: '提交表单',
  }))

  // ================= 操作按钮配置 =================
  const actionButtons = computed<ActionItem[]>(() => [
    {
      key: 'saveDraft',
      label: '保存草稿',
      icon: 'mdi:content-save',
      onClick: saveDraft,
    },
    {
      key: 'loadDraft',
      label: '加载草稿',
      icon: 'mdi:folder-open-outline',
      onClick: loadDraft,
    },
    {
      key: 'reset',
      label: '重置表单',
      icon: 'mdi:lock-reset',
      onClick: handleReset,
    },
  ])

  // ================= 事件处理 =================
  const handleReset = () => {
    resetFields()
    message.info('表单已重置')
  }

  // ==================== 工具方法 ====================
  const validate = async (): Promise<void> => {
    return formRef.value?.validate()
  }

  const resetFields = (): void => {
    formRef.value?.resetFields()
  }

  onMounted(() => {
    emit('fields-change', formOptions)
  })

  // ==================== 暴露方法 ====================
  defineExpose({
    validate,
    resetFields,
    formRef,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
