<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\index.vue
 * @Description: Cron 表达式编辑器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-cron"
    :style="{ height: containerHeight }"
  >
    <!-- 表达式输入区 -->
    <div class="c-cron__expression">
      <div class="c-cron__expression-label">
        <C_Icon
          name="mdi:clock-edit-outline"
          style="font-size: 18px"
        />
        <span>Cron 表达式</span>
      </div>
      <div class="c-cron__expression-input">
        <NInput
          :value="manualInput"
          :status="validation.valid ? undefined : 'error'"
          placeholder="秒 分 时 日 月 周，如：0 30 8 * * ?"
          :disabled="props.disabled"
          font="mono"
          clearable
          @update:value="handleManualInput"
          @blur="handleManualBlur"
          @keydown.enter="handleManualBlur"
        >
          <template #prefix>
            <C_Icon
              name="mdi:console"
              style="opacity: 0.5"
            />
          </template>
        </NInput>
        <NButton
          size="small"
          quaternary
          :disabled="props.disabled"
          @click="handleReset"
        >
          <template #icon>
            <C_Icon name="mdi:refresh" />
          </template>
          重置
        </NButton>
      </div>
      <!-- 校验 & 描述 -->
      <div class="c-cron__status">
        <NTag
          :type="validation.valid ? 'success' : 'error'"
          size="small"
          round
        >
          <template #icon>
            <C_Icon
              :name="validation.valid ? 'mdi:check-circle' : 'mdi:alert-circle'"
            />
          </template>
          {{ validation.valid ? '合法' : '错误' }}
        </NTag>
        <span
          v-if="validation.valid"
          class="c-cron__description"
        >
          {{ description }}
        </span>
        <span
          v-else
          class="c-cron__error"
        >
          {{ validation.message }}
        </span>
      </div>
    </div>

    <NDivider style="margin: 12px 0" />

    <!-- 主内容区 -->
    <div class="c-cron__body">
      <!-- 左侧：字段编辑器 Tabs -->
      <div class="c-cron__editor">
        <NTabs
          type="segment"
          animated
          size="small"
        >
          <NTabPane
            v-for="meta in visibleFields"
            :key="meta.type"
            :name="meta.type"
            :tab="meta.label"
          >
            <CronFieldEditor
              :model-value="cronValue[meta.type]"
              :meta="meta"
              @update:model-value="v => handleFieldChange(meta.type, v)"
            />
          </NTabPane>
        </NTabs>
      </div>

      <!-- 右侧面板 -->
      <div class="c-cron__sidebar">
        <!-- 模板 -->
        <CronTemplates
          v-if="props.showTemplates"
          :templates="CRON_TEMPLATES"
          :current-value="expression"
          @select="handleTemplateSelect"
        />

        <NDivider
          v-if="props.showTemplates && props.showPreview"
          style="margin: 12px 0"
        />

        <!-- 预览 -->
        <CronPreview
          v-if="props.showPreview"
          :next-executions="nextExecutions"
          :computing="computing"
          :count="props.previewCount ?? 10"
          :format-date="formatDate"
          :format-week-day="formatWeekDay"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    CronFieldType,
    CronFieldValue,
    CronProps,
    CronValidation,
  } from '@/types/modules/cron'
  import {
    CRON_FIELD_META,
    CRON_TEMPLATES,
    DEFAULT_CRON_EXPRESSION,
  } from './constants'
  import { useCronParser } from '@/composables/Cron/useCronParser'
  import { useCronPreview } from '@/composables/Cron/useCronPreview'
  import { useCronDescription } from '@/composables/Cron/useCronDescription'
  import CronFieldEditor from './components/CronFieldEditor.vue'
  import CronPreview from './components/CronPreview.vue'
  import CronTemplates from './components/CronTemplates.vue'

  // ─── Props & Emits ─────────────────────────────

  const props = withDefaults(defineProps<CronProps>(), {
    modelValue: DEFAULT_CRON_EXPRESSION,
    disabled: false,
    previewCount: 10,
    showTemplates: true,
    showPreview: true,
    showSecond: true,
    height: 'auto',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string]
    'validation-change': [result: CronValidation]
  }>()

  // ─── 组合函数 ──────────────────────────────────

  const {
    cronValue,
    expression,
    validation,
    parse,
    validate,
    handleDayWeekExclusion,
  } = useCronParser()

  const previewCount = computed(() => props.previewCount ?? 10)
  const { nextExecutions, computing, formatDate, formatWeekDay } =
    useCronPreview(expression, validation, previewCount)

  const { description } = useCronDescription(expression, validation)

  // ─── 本地状态 ──────────────────────────────────

  /** 手动输入框值（与 expression 解耦，输入完成后同步） */
  const manualInput = ref(props.modelValue || DEFAULT_CRON_EXPRESSION)

  // ─── 容器高度 ──────────────────────────────────

  const containerHeight = computed(() => {
    if (typeof props.height === 'number') return `${props.height}px`
    return props.height
  })

  // ─── 可见字段（是否显示秒） ────────────────────

  const visibleFields = computed(() => {
    return props.showSecond
      ? CRON_FIELD_META
      : CRON_FIELD_META.filter(m => m.type !== 'second')
  })

  // ─── 初始化解析 ────────────────────────────────

  onMounted(() => {
    const initial = props.modelValue || DEFAULT_CRON_EXPRESSION
    parse(initial)
    manualInput.value = initial
  })

  // ─── 监听外部 v-model 变更 ─────────────────────

  watch(
    () => props.modelValue,
    newVal => {
      if (newVal && newVal !== expression.value) {
        parse(newVal)
        manualInput.value = newVal
      }
    }
  )

  // ─── 监听内部表达式变更 → 同步到外部 ───────────

  watch(expression, newExpr => {
    manualInput.value = newExpr
    emit('update:modelValue', newExpr)
    emit('change', newExpr)
  })

  // ─── 监听校验状态变更 ──────────────────────────

  watch(validation, v => {
    emit('validation-change', v)
  })

  // ─── 字段变更处理 ──────────────────────────────
  /** 字段编辑变更处理 */ function handleFieldChange(
    type: CronFieldType,
    value: CronFieldValue
  ) {
    cronValue.value[type] = value
    // 日/周互斥
    if (type === 'day' || type === 'week') {
      handleDayWeekExclusion(type)
    }
  }

  // ─── 手动输入处理 ──────────────────────────────
  /** 手动输入更新 */ function handleManualInput(value: string) {
    manualInput.value = value
  }

  /** 输入框失焦时同步 */
  function handleManualBlur() {
    const trimmed = manualInput.value.trim()
    if (trimmed && trimmed !== expression.value) {
      parse(trimmed)
    }
  }

  // ─── 模板选择 ──────────────────────────────────
  /** 选择常用模板 */ function handleTemplateSelect(expr: string) {
    parse(expr)
    manualInput.value = expr
  }

  // ─── 重置 ──────────────────────────────────────
  /** 重置为初始值 */ function handleReset() {
    const initial = props.modelValue || DEFAULT_CRON_EXPRESSION
    parse(initial)
    manualInput.value = initial
  }

  // ─── Expose ────────────────────────────────────

  defineExpose({
    getValue: () => expression.value,
    setValue: (expr: string) => {
      parse(expr)
      manualInput.value = expr
    },
    reset: handleReset,
    validate: () => validate(),
  })
</script>

<style lang="scss" scoped>
  .c-cron {
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--card-color);

    // ─── 表达式输入区 ──────────────────────────

    &__expression {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__expression-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
    }

    &__expression-input {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    &__status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    &__description {
      color: var(--text-color-2);
    }

    &__error {
      color: var(--error-color);
    }

    // ─── 主内容区 ──────────────────────────────

    &__body {
      display: flex;
      gap: 16px;
    }

    &__editor {
      flex: 1;
      min-width: 0;
    }

    &__sidebar {
      width: 320px;
      flex-shrink: 0;
      padding-left: 16px;
      border-left: 1px solid var(--border-color);
    }
  }

  // ─── 响应式 ────────────────────────────────────

  @media (max-width: 768px) {
    .c-cron__body {
      flex-direction: column;
    }

    .c-cron__sidebar {
      width: 100%;
      padding-left: 0;
      border-left: none;
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
    }
  }
</style>
