<!--
 * @Author: ChenYu
 * @Date: 2025-05-29 08:20:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-22 10:45:22
 * @FilePath: \Robot_Admin\src\components\global\C_Time\index.vue
 * @Description: 时间选择器 — 薄 UI 壳，逻辑由 useTimeSelection 驱动
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <div class="c-time-wrapper">
    <!-- 时间段选择模式 -->
    <div
      v-if="mode === 'range'"
      class="time-range-container"
    >
      <NTimePicker
        v-model:value="startTime"
        :placeholder="startPlaceholder"
        :format="timeFormat"
        :actions="['now', 'confirm']"
        v-bind="mergedStartAttrs"
        @update:value="handleStartTimeChange"
      />
      <span class="range-separator">至</span>
      <NTimePicker
        v-model:value="endTime"
        :placeholder="endPlaceholder"
        :format="timeFormat"
        :actions="['now', 'confirm']"
        :is-hour-disabled="
          props.enableTimeRestriction ? isEndHourDisabled : undefined
        "
        :is-minute-disabled="
          props.enableTimeRestriction ? isEndMinuteDisabled : undefined
        "
        :is-second-disabled="
          props.enableTimeRestriction ? isEndSecondDisabled : undefined
        "
        :disabled="endTimeDisabled"
        v-bind="mergedEndAttrs"
        @update:value="handleEndTimeChange"
      />
    </div>

    <!-- 单个时间选择模式 -->
    <div
      v-else
      class="time-single-container"
    >
      <NTimePicker
        v-model:value="singleTime"
        :placeholder="placeholder"
        :format="timeFormat"
        :actions="['now', 'confirm']"
        v-bind="mergedAttrs"
        @update:value="handleSingleTimeChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useTimeSelection } from '@/composables/Time/useTimeSelection'
  import type { TimeProps, TimeEmits, TimeExpose } from '@/types/modules/time'

  const props = withDefaults(defineProps<TimeProps>(), {
    mode: 'range',
    startPlaceholder: '请选择开始时间',
    endPlaceholder: '请选择结束时间',
    placeholder: '请选择时间',
    format: 'HH:mm',
    useHours: true,
    useMinutes: true,
    useSeconds: false,
    hourStep: 1,
    minuteStep: 30,
    secondStep: 1,
    startTimeProps: () => ({}),
    endTimeProps: () => ({}),
    attrs: () => ({}),
    defaultStartTime: null,
    defaultEndTime: null,
    defaultSingleTime: null,
    enableTimeRestriction: false,
  })

  const emit = defineEmits<TimeEmits>()

  const {
    startTime,
    endTime,
    singleTime,
    timeFormat,
    endTimeDisabled,
    mergedStartAttrs,
    mergedEndAttrs,
    mergedAttrs,
    isEndHourDisabled,
    isEndMinuteDisabled,
    isEndSecondDisabled,
    handleStartTimeChange,
    handleEndTimeChange,
    handleSingleTimeChange,
    reset,
  } = useTimeSelection(props, emit)

  defineExpose<TimeExpose>({
    reset,
    startTime,
    endTime,
    singleTime,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
