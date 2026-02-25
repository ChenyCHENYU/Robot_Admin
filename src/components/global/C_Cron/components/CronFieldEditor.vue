<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\components\CronFieldEditor.vue
 * @Description: Cron 单字段编辑器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-field-editor">
    <div class="cron-field-editor__header">
      <span class="cron-field-editor__label">{{ meta.label }}</span>
      <NTag
        size="tiny"
        :type="
          fieldExpression === '*' || fieldExpression === '?'
            ? 'default'
            : 'info'
        "
        round
      >
        {{ fieldExpression }}
      </NTag>
    </div>

    <NRadioGroup
      :value="modelValue.mode"
      class="cron-field-editor__modes"
      @update:value="handleModeChange"
    >
      <!-- 每 -->
      <NRadio value="every"> 每{{ meta.label }} </NRadio>

      <!-- 不指定（仅日/周） -->
      <NRadio
        v-if="meta.type === 'day' || meta.type === 'week'"
        value="none"
      >
        不指定
      </NRadio>

      <!-- 范围 -->
      <NRadio value="range">
        <div class="cron-field-editor__inline">
          范围：从
          <NInputNumber
            :value="modelValue.rangeStart"
            :min="meta.min"
            :max="meta.max"
            :disabled="modelValue.mode !== 'range'"
            size="tiny"
            :show-button="false"
            class="cron-field-editor__num"
            @update:value="
              (v: number | null) => emitUpdate({ rangeStart: v ?? meta.min })
            "
          />
          到
          <NInputNumber
            :value="modelValue.rangeEnd"
            :min="meta.min"
            :max="meta.max"
            :disabled="modelValue.mode !== 'range'"
            size="tiny"
            :show-button="false"
            class="cron-field-editor__num"
            @update:value="
              (v: number | null) => emitUpdate({ rangeEnd: v ?? meta.max })
            "
          />
        </div>
      </NRadio>

      <!-- 步进 -->
      <NRadio value="step">
        <div class="cron-field-editor__inline">
          从
          <NInputNumber
            :value="modelValue.stepStart"
            :min="meta.min"
            :max="meta.max"
            :disabled="modelValue.mode !== 'step'"
            size="tiny"
            :show-button="false"
            class="cron-field-editor__num"
            @update:value="
              (v: number | null) => emitUpdate({ stepStart: v ?? meta.min })
            "
          />
          开始，每
          <NInputNumber
            :value="modelValue.stepInterval"
            :min="1"
            :max="meta.max - meta.min + 1"
            :disabled="modelValue.mode !== 'step'"
            size="tiny"
            :show-button="false"
            class="cron-field-editor__num"
            @update:value="
              (v: number | null) => emitUpdate({ stepInterval: v ?? 1 })
            "
          />
          {{ meta.label }}执行
        </div>
      </NRadio>

      <!-- 指定 -->
      <NRadio value="specific"> 指定 </NRadio>
    </NRadioGroup>

    <!-- 指定值选择网格 -->
    <div
      v-if="modelValue.mode === 'specific'"
      class="cron-field-editor__grid"
    >
      <NCheckboxGroup
        :value="modelValue.specificValues"
        @update:value="handleSpecificChange"
      >
        <div class="cron-field-editor__grid-inner">
          <NCheckbox
            v-for="item in valueOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </div>
      </NCheckboxGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    CronFieldMeta,
    CronFieldMode,
    CronFieldValue,
  } from '@/types/modules/cron'

  interface Props {
    modelValue: CronFieldValue
    meta: CronFieldMeta
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: CronFieldValue]
  }>()

  // ─── 当前字段表达式预览 ────────────────────────

  const fieldExpression = computed(() => {
    const f = props.modelValue
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
          ? f.specificValues.sort((a, b) => a - b).join(',')
          : '*'
      default:
        return '*'
    }
  })

  // ─── 可选值列表 ────────────────────────────────

  const valueOptions = computed(() => {
    const items: { value: number; label: string }[] = []
    for (let i = props.meta.min; i <= props.meta.max; i++) {
      const label = props.meta.valueLabels?.[i] ?? String(i)
      items.push({ value: i, label })
    }
    return items
  })

  // ─── 模式切换 ──────────────────────────────────
  /** 切换编辑模式 */ function handleModeChange(mode: CronFieldMode) {
    emit('update:modelValue', { ...props.modelValue, mode })
  }

  // ─── 指定值更新 ────────────────────────────────
  /** 更新指定值列表 */ function handleSpecificChange(values: number[]) {
    emit('update:modelValue', {
      ...props.modelValue,
      specificValues: [...values],
    })
  }

  // ─── 通用属性更新 ──────────────────────────────
  /** 发射局部属性更新 */ function emitUpdate(
    partial: Partial<CronFieldValue>
  ) {
    emit('update:modelValue', { ...props.modelValue, ...partial })
  }
</script>

<style lang="scss" scoped>
  .cron-field-editor {
    &__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    &__label {
      font-weight: 600;
      font-size: 14px;
    }

    &__modes {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    &__inline {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    &__num {
      width: 70px;
    }

    &__grid {
      margin-top: 8px;
      padding: 8px;
      border-radius: 6px;
      background: var(--code-color);
      border: 1px solid var(--border-color);
    }

    &__grid-inner {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 4px;
    }
  }
</style>
