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
      layout-type="inline"
      :layout-config="layoutConfig"
      :validate-on-value-change="validateOnChange"
      :label-placement="labelPlacement"
      v-model="formData"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
    >
      <template #action="{ validate, reset }">
        <div class="flex gap-3 mt-4">
          <NButton
            type="primary"
            :loading="submitLoading"
            @click="submitForm(validate)"
          >
            <template #icon>
              <div class="i-mdi-magnify"></div>
            </template>
            {{ submitLoading ? '搜索中...' : '搜索' }}
          </NButton>

          <NButton @click="resetForm(reset)">
            <template #icon>
              <div class="i-mdi-refresh"></div>
            </template>
            重置
          </NButton>

          <NButton
            type="info"
            @click="showAdvanced = !showAdvanced"
          >
            <template #icon>
              <div
                :class="
                  showAdvanced ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'
                "
              ></div>
            </template>
            {{ showAdvanced ? '收起' : '高级' }}
          </NButton>
        </div>
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
  import type {
    LabelPlacement,
    FormInstance,
    FormModel,
    LayoutConfig,
  } from '@/types/modules/form'
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

  withDefaults(defineProps<Props>(), {
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

  const formData = defineModel<FormModel>({ required: true })

  // ==================== 响应式状态 ====================
  const formRef = ref<FormInstance | null>(null)
  const submitLoading = ref(false)
  const showAdvanced = ref(false)
  const inlineGap = ref(defaultConfig.gap)
  const alignType = ref(defaultConfig.align)
  const message = useMessage()

  // 高级搜索数据
  const advancedData = ref({ ...defaultAdvancedData })

  // ==================== 计算属性 ====================
  const layoutConfig = computed(
    (): LayoutConfig => ({
      type: 'inline',
      inline: {
        gap: inlineGap.value,
        align: alignType.value as any,
      },
    })
  )

  // ==================== 方法 ====================
  const submitForm = async (validate: () => Promise<void>) => {
    try {
      submitLoading.value = true
      await validate()

      const submitData = {
        ...formData.value,
        advanced: showAdvanced.value ? advancedData.value : null,
      }

      emit('submit', submitData)
      message.success('内联布局搜索成功！')
    } catch (error) {
      message.error('表单验证失败，请检查输入')
      throw error
    } finally {
      submitLoading.value = false
    }
  }

  const resetForm = (reset: () => void) => {
    reset()
    advancedData.value = { ...defaultAdvancedData }
    message.info('表单已重置')
  }

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
    resetFields: () => {
      formRef.value?.resetFields()
      advancedData.value = { ...defaultAdvancedData }
    },
  })
</script>
