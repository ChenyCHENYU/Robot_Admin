<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\index.vue
 * @Description: Cron 表达式编辑器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-cron"
    :style="{ height: containerHeight }"
  >
    <!-- ═══════ 顶部 ═══════ -->
    <div class="c-cron__header">
      <!-- 标题行 -->
      <div class="c-cron__title-row">
        <div class="c-cron__title">
          <C_Icon
            name="mdi:clock-edit-outline"
            style="font-size: 18px"
          />
          <span>Cron 表达式</span>
        </div>
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
      </div>

      <!-- 分段式字段选择器 -->
      <div class="c-cron__segments">
        <div
          v-for="meta in visibleFields"
          :key="meta.type"
          class="c-cron__segment"
          :class="{
            'c-cron__segment--active': activeField === meta.type,
            'c-cron__segment--wildcard':
              fieldExpressions[meta.type] === '*' ||
              fieldExpressions[meta.type] === '?',
          }"
          @click="activeField = meta.type"
        >
          <div class="c-cron__segment-value">
            {{ fieldExpressions[meta.type] }}
          </div>
          <div class="c-cron__segment-label">{{ meta.label }}</div>
        </div>
      </div>

      <!-- 表达式行：输入 + 重置 + 描述 -->
      <div class="c-cron__expr-row">
        <NInput
          :value="manualInput"
          :status="validation.valid ? undefined : 'error'"
          placeholder="秒 分 时 日 月 周"
          :disabled="props.disabled"
          font="mono"
          size="small"
          clearable
          class="c-cron__expr-input"
          @update:value="handleManualInput"
          @blur="handleManualBlur"
          @keydown.enter="handleManualBlur"
        >
          <template #prefix>
            <C_Icon
              name="mdi:console"
              style="opacity: 0.4"
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
        </NButton>
        <div class="c-cron__expr-desc">
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
    </div>

    <!-- ═══════ 主内容 ═══════ -->
    <div class="c-cron__body">
      <!-- 左侧：值网格 -->
      <div class="c-cron__main">
        <CronFieldEditor
          v-for="meta in visibleFields"
          v-show="activeField === meta.type"
          :key="meta.type"
          :model-value="cronValue[meta.type]"
          :meta="meta"
          @update:model-value="v => handleFieldChange(meta.type, v)"
        />
      </div>

      <!-- 右侧：控制面板 -->
      <div class="c-cron__panel">
        <NRadioGroup
          :value="activeFieldValue.mode"
          size="small"
          @update:value="handleActiveFieldModeChange"
        >
          <NRadioButton value="every">
            每{{ activeFieldMeta.label }}
          </NRadioButton>
          <NRadioButton
            v-if="activeField === 'day' || activeField === 'week'"
            value="none"
          >
            不指定
          </NRadioButton>
          <NRadioButton value="range">范围</NRadioButton>
          <NRadioButton value="step">步进</NRadioButton>
          <NRadioButton value="specific">指定</NRadioButton>
        </NRadioGroup>

        <!-- 范围配置 -->
        <div
          v-if="activeFieldValue.mode === 'range'"
          class="c-cron__config"
        >
          <div class="c-cron__config-row">
            <span>从</span>
            <NInputNumber
              :value="activeFieldValue.rangeStart"
              :min="activeFieldMeta.min"
              :max="activeFieldMeta.max"
              size="small"
              :show-button="false"
              class="c-cron__config-num"
              @update:value="
                (v: number | null) =>
                  handleActiveFieldUpdate({
                    rangeStart: v ?? activeFieldMeta.min,
                  })
              "
            />
            <span>到</span>
            <NInputNumber
              :value="activeFieldValue.rangeEnd"
              :min="activeFieldMeta.min"
              :max="activeFieldMeta.max"
              size="small"
              :show-button="false"
              class="c-cron__config-num"
              @update:value="
                (v: number | null) =>
                  handleActiveFieldUpdate({
                    rangeEnd: v ?? activeFieldMeta.max,
                  })
              "
            />
          </div>
        </div>

        <!-- 步进配置 -->
        <div
          v-if="activeFieldValue.mode === 'step'"
          class="c-cron__config"
        >
          <div class="c-cron__config-row">
            <span>从第</span>
            <NInputNumber
              :value="activeFieldValue.stepStart"
              :min="activeFieldMeta.min"
              :max="activeFieldMeta.max"
              size="small"
              :show-button="false"
              class="c-cron__config-num"
              @update:value="
                (v: number | null) =>
                  handleActiveFieldUpdate({
                    stepStart: v ?? activeFieldMeta.min,
                  })
              "
            />
            <span>{{ activeFieldMeta.label }}起，每</span>
            <NInputNumber
              :value="activeFieldValue.stepInterval"
              :min="1"
              :max="activeFieldMeta.max - activeFieldMeta.min + 1"
              size="small"
              :show-button="false"
              class="c-cron__config-num"
              @update:value="
                (v: number | null) =>
                  handleActiveFieldUpdate({ stepInterval: v ?? 1 })
              "
            />
            <span>{{ activeFieldMeta.label }}执行</span>
          </div>
        </div>

        <!-- 指定快捷操作 -->
        <div
          v-if="activeFieldValue.mode === 'specific'"
          class="c-cron__quick"
        >
          <a @click="handleSelectAll">全选</a>
          <span class="c-cron__quick-sep">·</span>
          <a @click="handleClearAll">清空</a>
          <span
            v-if="activeFieldValue.specificValues.length > 0"
            class="c-cron__quick-count"
          >
            已选 {{ activeFieldValue.specificValues.length }}
          </span>
        </div>

        <!-- 执行预览 -->
        <template v-if="props.showPreview">
          <div class="c-cron__panel-line" />
          <CronPreview
            :next-executions="nextExecutions"
            :computing="computing"
            :count="props.previewCount ?? 5"
            :format-date="formatDate"
            :format-week-day="formatWeekDay"
          />
        </template>
      </div>
    </div>

    <!-- ═══════ 底部模板 ═══════ -->
    <div
      v-if="props.showTemplates"
      class="c-cron__footer"
    >
      <CronTemplates
        :templates="CRON_TEMPLATES"
        :current-value="expression"
        @select="handleTemplateSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    CronFieldMode,
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

  /** 当前激活的字段 Tab */
  const activeField = ref<CronFieldType>(props.showSecond ? 'second' : 'minute')

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

  // ─── 当前激活字段快捷访问 ─────────────────────

  /** 当前激活字段元数据 */
  const activeFieldMeta = computed(
    () => CRON_FIELD_META.find(m => m.type === activeField.value)!
  )

  /** 当前激活字段值 */
  const activeFieldValue = computed(() => cronValue.value[activeField.value])

  // ─── 分段式表达式（逐字段计算） ────────────────

  /** 计算单字段表达式文本 */
  function computeFieldExpr(f: CronFieldValue): string {
    switch (f.mode) {
      case 'every':
        return '*'
      case 'none':
        return '?'
      case 'range':
        return `${f.rangeStart}-${f.rangeEnd}`
      case 'step':
        return `${f.stepStart}/${f.stepInterval}`
      case 'specific':
        return f.specificValues.length > 0
          ? [...f.specificValues].sort((a, b) => a - b).join(',')
          : '*'
      default:
        return '*'
    }
  }

  /** 各字段表达式映射 */
  const fieldExpressions = computed(() => {
    const map = {} as Record<CronFieldType, string>
    for (const meta of CRON_FIELD_META) {
      map[meta.type] = computeFieldExpr(cronValue.value[meta.type])
    }
    return map
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

  // ─── 监听 showSecond 变更 ──────────────────────

  watch(
    () => props.showSecond,
    show => {
      if (!show && activeField.value === 'second') {
        activeField.value = 'minute'
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

  /** 字段编辑变更处理 */
  function handleFieldChange(type: CronFieldType, value: CronFieldValue) {
    cronValue.value[type] = value
    if (type === 'day' || type === 'week') {
      handleDayWeekExclusion(type)
    }
  }

  // ─── 右侧面板操作 ─────────────────────────────

  /** 切换当前字段模式 */
  function handleActiveFieldModeChange(mode: CronFieldMode) {
    handleFieldChange(activeField.value, {
      ...activeFieldValue.value,
      mode,
    })
  }

  /** 更新当前字段属性 */
  function handleActiveFieldUpdate(partial: Partial<CronFieldValue>) {
    handleFieldChange(activeField.value, {
      ...activeFieldValue.value,
      ...partial,
    })
  }

  /** 全选当前字段所有值 */
  function handleSelectAll() {
    const { min, max } = activeFieldMeta.value
    const allValues = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    handleFieldChange(activeField.value, {
      ...activeFieldValue.value,
      specificValues: allValues,
    })
  }

  /** 清空当前字段所有选中值 */
  function handleClearAll() {
    handleFieldChange(activeField.value, {
      ...activeFieldValue.value,
      specificValues: [],
    })
  }

  // ─── 手动输入处理 ──────────────────────────────

  /** 手动输入更新 */
  function handleManualInput(value: string) {
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

  /** 选择常用模板 */
  function handleTemplateSelect(expr: string) {
    parse(expr)
    manualInput.value = expr
  }

  // ─── 重置 ──────────────────────────────────────

  /** 重置为初始值 */
  function handleReset() {
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
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--card-color);

    // ═══════ 顶部 ═══════

    &__header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 16px;
    }

    &__title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 15px;
    }

    // ─── 分段式字段选择器 ────────────────────

    &__segments {
      display: flex;
      gap: 2px;
      padding: 3px;
      border-radius: 10px;
      background: var(--code-color);
    }

    &__segment {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 6px 5px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      min-width: 0;

      &:not(&--active):hover {
        background: color-mix(in srgb, var(--card-color) 60%, transparent);
      }

      &--active {
        background: var(--card-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

        .c-cron__segment-value {
          color: var(--primary-color);
        }
      }

      &--wildcard:not(&--active) {
        .c-cron__segment-value {
          opacity: 0.35;
        }
      }
    }

    &__segment-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.3;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }

    &__segment-label {
      font-size: 11px;
      color: var(--text-color-3);
      margin-top: 2px;
    }

    // ─── 表达式行 ───────────────────────────

    &__expr-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__expr-input {
      width: 240px;
      flex-shrink: 0;
    }

    &__expr-desc {
      flex: 1;
      font-size: 13px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__description {
      color: var(--text-color-2);
    }

    &__error {
      color: var(--error-color);
    }

    // ═══════ 主内容 ═══════

    &__body {
      display: flex;
      gap: 24px;
    }

    &__main {
      flex: 1;
      min-width: 0;
    }

    // ─── 右侧控制面板 ──────────────────────

    &__panel {
      width: 260px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    &__config {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__config-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-color-2);
      flex-wrap: wrap;
    }

    &__config-num {
      width: 68px;
    }

    &__quick {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;

      a {
        color: var(--primary-color);
        cursor: pointer;
        user-select: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    &__quick-sep {
      color: var(--text-color-3);
    }

    &__quick-count {
      margin-left: 4px;
      font-size: 12px;
      color: var(--text-color-3);
    }

    &__panel-line {
      height: 1px;
      background: var(--border-color);
    }

    // ═══════ 底部模板 ═══════

    &__footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
  }

  // ─── 响应式 ────────────────────────────────

  @media (max-width: 768px) {
    .c-cron__body {
      flex-direction: column;
    }

    .c-cron__panel {
      width: 100%;
    }

    .c-cron__segments {
      flex-wrap: wrap;
    }

    .c-cron__segment {
      min-width: calc(33% - 4px);
    }

    .c-cron__expr-row {
      flex-wrap: wrap;
    }

    .c-cron__expr-input {
      width: 100%;
    }
  }
</style>
