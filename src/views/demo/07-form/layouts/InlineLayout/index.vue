<template>
  <div class="inline-layout">
    <!-- 内联布局配置 -->
    <NCard
      class="mb-6"
      :bordered="false"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <div class="i-mdi-tune text-lg"></div>
          内联布局配置
        </div>
      </template>

      <div class="flex gap-8 items-center flex-wrap">
        <div class="flex items-center gap-3">
          <span class="text-sm">元素间距</span>
          <div class="flex items-center gap-2">
            <input
              v-model="inlineGap"
              type="range"
              min="8"
              max="32"
              class="w-24"
            />
            <span class="text-xs text-gray-500 min-w-12"
              >{{ inlineGap }}px</span
            >
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm">对齐方式</span>
          <div class="flex rounded border">
            <button
              v-for="option in alignOptions"
              :key="option.value"
              :class="[
                'px-3 py-1 text-xs border-0 transition-all',
                alignType === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ]"
              @click="alignType = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </NCard>

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
      <template #action="{ submit, submitting, reset }">
        <NSpace :size="12">
          <NButton
            type="primary"
            :loading="submitting"
            @click="submit"
            >搜索</NButton
          >
          <NButton
            :disabled="submitting"
            @click="resetForm(reset)"
            >重置</NButton
          >
          <NButton
            type="info"
            :disabled="submitting"
            @click="showAdvanced = !showAdvanced"
            >{{ showAdvanced ? '收起' : '高级' }}</NButton
          >
        </NSpace>
      </template>
    </C_Form>

    <!-- 高级搜索选项 -->
    <div
      v-if="showAdvanced"
      class="mt-6"
    >
      <NCard :bordered="false">
        <template #header>
          <div class="flex items-center gap-2">
            <div class="i-mdi-filter-variant text-lg"></div>
            高级搜索选项
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm mb-2">注册时间范围</div>
            <NDatePicker
              v-model:value="advancedData.dateRange"
              type="daterange"
              placeholder="选择时间范围"
              class="w-full"
            />
          </div>

          <div>
            <div class="text-sm mb-2">用户状态</div>
            <NSelect
              v-model:value="advancedData.userStatus"
              :options="statusOptions"
              placeholder="选择用户状态"
              clearable
            />
          </div>

          <div>
            <div class="text-sm mb-2">排序方式</div>
            <NSelect
              v-model:value="advancedData.sortBy"
              :options="sortOptions"
              placeholder="选择排序方式"
              clearable
            />
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo07FormInlineLayout' })
  import type {
    LabelPlacement,
    FormInstance,
    FormModel,
    FormOption,
    InlineLayoutConfig,
  } from '@robot-admin/naive-ui-components'
  import {
    formOptions,
    alignOptions,
    statusOptions,
    sortOptions,
    defaultConfig,
    defaultAdvancedData,
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

  const { labelPlacement, validateOnChange } = toRefs(props)

  // ==================== Emits ====================
  const emit = defineEmits<{
    submit: [payload: { model: FormModel }]
    'validate-success': [model: FormModel]
    'validate-error': [errors: unknown]
    'fields-change': [fields: FormOption[]]
  }>()

  const formData = defineModel<FormModel>({ required: true })

  // ==================== 响应式状态 ====================
  const formRef = ref<FormInstance | null>(null)
  const showAdvanced = ref(false)
  const inlineGap = ref(defaultConfig.gap)
  const alignType = ref(defaultConfig.align)
  const message = useMessage()

  // 高级搜索数据
  const advancedData = ref({ ...defaultAdvancedData })

  // ==================== 计算属性 ====================
  const formConfig = computed(() => ({
    layout: 'inline' as const,
    inline: {
      gap: inlineGap.value,
      align: alignType.value as InlineLayoutConfig['align'],
    },
    validateOnChange: validateOnChange.value,
    labelPlacement: labelPlacement.value,
  }))

  // ==================== 方法 ====================
  const resetForm = (reset: () => void) => {
    reset()
    advancedData.value = { ...defaultAdvancedData }
    message.info('表单已重置')
  }

  const handleSubmit = (payload: { model: FormModel }) =>
    emit('submit', {
      model: {
        ...payload.model,
        advanced: showAdvanced.value ? { ...advancedData.value } : null,
      },
    })
  const handleValidateSuccess = (model: FormModel) =>
    emit('validate-success', model)
  const handleValidateError = (errors: unknown) =>
    emit('validate-error', errors)

  // ==================== 生命周期 ====================
  onMounted(() => {
    emit('fields-change', formOptions)
  })

  // ==================== 暴露的方法 ====================
  defineExpose({
    validate: () => formRef.value?.validate(),
    resetFields: () => {
      formRef.value?.resetFields()
      advancedData.value = { ...defaultAdvancedData }
    },
  })
</script>
