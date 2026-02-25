<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Cron\components\CronFieldEditor.vue
 * @Description: Cron 字段值网格（始终可见，根据模式自动高亮对应值）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cron-field-editor">
    <div
      class="cron-field-editor__grid"
      :style="{ '--cols': gridColumns }"
    >
      <div
        v-for="item in valueOptions"
        :key="item.value"
        class="cron-field-editor__cell"
        :class="{
          'cron-field-editor__cell--on': highlightedValues.has(item.value),
          'cron-field-editor__cell--pick': modelValue.mode === 'specific',
        }"
        @click="handleCellClick(item.value)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CronFieldMeta, CronFieldValue } from '@/types/modules/cron'

  interface Props {
    modelValue: CronFieldValue
    meta: CronFieldMeta
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: CronFieldValue]
  }>()

  /** 网格列数 */
  const gridColumns = computed(() => {
    switch (props.meta.type) {
      case 'second':
      case 'minute':
        return 10
      case 'hour':
        return 12
      case 'day':
        return 7
      case 'month':
        return 6
      case 'week':
        return 7
      default:
        return 10
    }
  })

  /** 可选值列表 */
  const valueOptions = computed(() => {
    const items: { value: number; label: string }[] = []
    for (let i = props.meta.min; i <= props.meta.max; i++) {
      items.push({
        value: i,
        label: props.meta.valueLabels?.[i] ?? String(i),
      })
    }
    return items
  })

  /** 根据当前模式计算高亮值集合 */
  const highlightedValues = computed(() => {
    const { modelValue: f, meta } = props
    const set = new Set<number>()
    switch (f.mode) {
      case 'every':
        for (let i = meta.min; i <= meta.max; i++) set.add(i)
        break
      case 'none':
        break
      case 'range':
        for (let i = f.rangeStart; i <= f.rangeEnd; i++) set.add(i)
        break
      case 'step':
        for (let i = f.stepStart; i <= meta.max; i += f.stepInterval) set.add(i)
        break
      case 'specific':
        f.specificValues.forEach(v => set.add(v))
        break
    }
    return set
  })

  /** 点击单元格（仅 specific 模式生效） */
  function handleCellClick(value: number) {
    if (props.modelValue.mode !== 'specific') return
    const current = [...props.modelValue.specificValues]
    const idx = current.indexOf(value)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(value)
    emit('update:modelValue', {
      ...props.modelValue,
      specificValues: current,
    })
  }
</script>

<style lang="scss" scoped>
  .cron-field-editor {
    &__grid {
      display: grid;
      grid-template-columns: repeat(var(--cols, 10), 1fr);
      gap: 4px;
    }

    &__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      border-radius: 6px;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      transition: all 0.15s;
      user-select: none;
      color: var(--text-color-2);

      // 非交互高亮（every / range / step 的视觉反馈）
      &--on:not(&--pick) {
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
        color: var(--primary-color);
      }

      // 可交互模式（specific）
      &--pick {
        cursor: pointer;

        &:hover:not(.cron-field-editor__cell--on) {
          background: var(--hover-color);
        }

        &.cron-field-editor__cell--on {
          background: var(--primary-color);
          color: #fff;
          font-weight: 600;
        }
      }
    }
  }
</style>
