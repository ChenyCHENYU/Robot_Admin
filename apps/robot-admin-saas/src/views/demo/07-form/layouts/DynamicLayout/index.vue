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
          layout-type="dynamic"
          :layout-config="layoutConfig"
          :label-placement="labelPlacement"
          :validate-on-value-change="validateOnChange"
          @submit="handleSubmit"
          @validate-success="handleValidateSuccess"
          @validate-error="handleValidateError"
          @field-add="handleFieldAdd"
          @field-remove="handleFieldRemove"
          @field-toggle="handleFieldToggle"
          @fields-clear="handleFieldsClear"
          @fields-change="handleFieldsChange"
        >
          <!-- 自定义操作按钮 -->
          <template #action="{ validate, reset }">
            <div class="form-actions">
              <NSpace justify="center">
                <NButton
                  :type="FORM_ACTIONS.submit.type"
                  :size="FORM_ACTIONS.submit.size"
                  :loading="submitLoading"
                  @click="submitWithValidation(validate)"
                >
                  <template #icon>
                    <div :class="FORM_ACTIONS.submit.icon"></div>
                  </template>
                  {{ FORM_ACTIONS.submit.getText(submitLoading) }}
                </NButton>

                <NButton
                  :size="FORM_ACTIONS.reset.size"
                  @click="reset"
                >
                  <template #icon>
                    <div :class="FORM_ACTIONS.reset.icon"></div>
                  </template>
                  {{ FORM_ACTIONS.reset.text }}
                </NButton>

                <NButton
                  :size="FORM_ACTIONS.preview.size"
                  @click="previewData"
                >
                  <template #icon>
                    <div :class="FORM_ACTIONS.preview.icon"></div>
                  </template>
                  {{ FORM_ACTIONS.preview.text }}
                </NButton>
              </NSpace>
            </div>
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
              <div class="i-mdi:close"></div>
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
  import type {
    FormModel,
    FormInstance,
    LabelPlacement,
    DynamicFieldConfig,
    DynamicFormConfig,
  } from '@/types/modules/form'
  import {
    useDynamicFormState,
    DYNAMIC_FORM_STATE_KEY,
  } from '@/composables/Form/useDynamicFormState'
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
    VALIDATION_CONFIG,
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

  // ================= 页面状态 =================
  const formRef = ref<FormInstance>()
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
    try {
      submitLoading.value = true
      await validate()

      // 模拟提交延迟
      await new Promise(resolve =>
        setTimeout(resolve, VALIDATION_CONFIG.SUBMIT_DELAY)
      )

      console.log(
        VALIDATION_CONFIG.MESSAGES.SUBMIT_SUCCESS,
        '包含字段数量:',
        allFields.value.length
      )
    } catch (error) {
      console.error(VALIDATION_CONFIG.MESSAGES.SUBMIT_ERROR, error)
    } finally {
      submitLoading.value = false
    }
  }

  // ================= 事件处理方法 =================
  const handleSubmit = (payload: any) => {
    console.log(VALIDATION_CONFIG.MESSAGES.SUBMIT_SUCCESS, payload)
    emit('submit', payload) // 🔥 关键：向父组件转发事件
  }

  const handleValidateSuccess = (model: FormModel) => {
    console.log(VALIDATION_CONFIG.MESSAGES.VALIDATION_SUCCESS, model)
    emit('validate-success', model) // 🔥 关键：向父组件转发事件
  }

  const handleValidateError = (errors: any) => {
    console.error(VALIDATION_CONFIG.MESSAGES.VALIDATION_ERROR, errors)
    emit('validate-error', errors) // 🔥 关键：向父组件转发事件
  }

  const handleFieldAdd = (fieldConfig: DynamicFieldConfig) => {
    console.log(VALIDATION_CONFIG.MESSAGES.FIELD_ADD, fieldConfig)
  }

  const handleFieldRemove = (fieldId: string) => {
    console.log(VALIDATION_CONFIG.MESSAGES.FIELD_REMOVE, fieldId)
  }

  const handleFieldToggle = (fieldId: string, visible: boolean) => {
    console.log(VALIDATION_CONFIG.MESSAGES.FIELD_TOGGLE, fieldId, visible)
  }

  const handleFieldsClear = () => {
    console.log(VALIDATION_CONFIG.MESSAGES.FIELDS_CLEAR)
  }

  const handleFieldsChange = (fields: any[]) => {
    console.log('字段变化:', fields.length)
    emit('fields-change', fields) // 🔥 关键：向父组件转发事件
  }

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
    { deep: true }
  )

  // ================= 生命周期 =================
  onMounted(() => {
    // 初始化动态表单状态
    dynamicState.initialize(BASE_FORM_OPTIONS, formConfig)

    // 🔥 关键：主动触发fields-change事件
    nextTick(() => {
      emit('fields-change', allFields.value)
    })

    console.log('✅ 动态表单演示页面初始化完成')
    console.log('📝 基础字段数量:', BASE_FORM_OPTIONS.length)
    console.log('⚙️ 配置信息:', formConfig)
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
