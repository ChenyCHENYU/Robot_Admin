<!--
 * @Author: ChenYu
 * @Date: 2025-05-29 08:20:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-22 10:45:22
 * @FilePath: \Robot_Admin\src\components\global\C_Time\index.vue
 * @Description: 基于 NaiveUI 的时间选择器组件化二次封装
 * 支持多种时间选择模式：时间段选择、单个时间选择、时分秒选择等
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
  import type { TimePickerProps } from 'naive-ui/es'

  /**
   * 组件属性接口定义
   */
  interface Props {
    /** 时间选择模式：'range' 时间段选择，'single' 单个时间选择 */
    mode?: 'range' | 'single'
    /** 开始时间占位符（仅在 range 模式下生效） */
    startPlaceholder?: string
    /** 结束时间占位符（仅在 range 模式下生效） */
    endPlaceholder?: string
    /** 单个时间选择占位符（仅在 single 模式下生效） */
    placeholder?: string
    /** 时间格式 */
    format?: string
    /** 是否包含小时选择 */
    useHours?: boolean
    /** 是否包含分钟选择 */
    useMinutes?: boolean
    /** 是否包含秒选择 */
    useSeconds?: boolean
    /** 小时步进值 */
    hourStep?: number
    /** 分钟步进值 */
    minuteStep?: number
    /** 秒步进值 */
    secondStep?: number
    /** 开始时间选择器的额外属性 */
    startTimeProps?: Partial<TimePickerProps>
    /** 结束时间选择器的额外属性 */
    endTimeProps?: Partial<TimePickerProps>
    /** 传递给时间选择器的通用属性 */
    attrs?: Partial<TimePickerProps>
    /** 默认开始时间值 */
    defaultStartTime?: number | null
    /** 默认结束时间值 */
    defaultEndTime?: number | null
    /** 默认单个时间值 */
    defaultSingleTime?: number | null
    /** 是否启用智能时间限制（结束时间不能早于开始时间） */
    enableTimeRestriction?: boolean
  }

  /**
   * 设置默认属性值
   */
  const props = withDefaults(defineProps<Props>(), {
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

  /**
   * 事件定义
   */
  const emits = defineEmits<{
    /** 时间段改变事件（仅在 range 模式下触发） */
    'change-range': [startTime: number | null, endTime: number | null]
    /** 单个时间改变事件（仅在 single 模式下触发） */
    'change-single': [time: number | null]
    /** 开始时间改变事件 */
    'change-start': [time: number | null]
    /** 结束时间改变事件 */
    'change-end': [time: number | null]
  }>()

  /**
   * 响应式数据
   */
  const startTime: Ref<number | null> = ref(props.defaultStartTime)
  const endTime: Ref<number | null> = ref(props.defaultEndTime)
  const singleTime: Ref<number | null> = ref(props.defaultSingleTime)

  /**
   * 计算属性 - 时间格式
   */
  const timeFormat = computed(() => {
    if (props.useSeconds) {
      return props.format.includes('ss') ? props.format : 'HH:mm:ss'
    }
    return props.format
  })

  /**
   * 计算属性 - 结束时间是否禁用
   */
  const endTimeDisabled = computed(() => {
    return props.mode === 'range' && !startTime.value
  })

  /**
   * 计算属性 - 合并后的开始时间属性
   */
  const mergedStartAttrs = computed(() => ({
    ...props.attrs,
    ...props.startTimeProps,
  }))

  /**
   * 计算属性 - 合并后的结束时间属性
   */
  const mergedEndAttrs = computed(() => ({
    ...props.attrs,
    ...props.endTimeProps,
  }))

  /**
   * 计算属性 - 合并后的通用属性
   */
  const mergedAttrs = computed(() => ({
    ...props.attrs,
  }))

  /**
   * * @description 开始时间变化处理函数
   * ? @param value - 新的开始时间值
   * ! @return void
   */
  const handleStartTimeChange = (value: number | null) => {
    startTime.value = value

    // 如果开始时间被清空，同时清空结束时间
    if (!value) {
      endTime.value = null
    } else if (props.enableTimeRestriction && endTime.value) {
      // 如果启用了时间限制且已有结束时间，检查是否需要重置结束时间
      if (endTime.value <= value) {
        endTime.value = null
      }
    }

    emits('change-start', value)

    // 如果两个时间都有值，触发时间段改变事件
    if (props.mode === 'range') {
      emits('change-range', value, endTime.value)
    }
  }

  /**
   * * @description 判断结束时间的小时是否应该被禁用
   * ? @param hour - 小时值
   * ! @return 是否禁用
   */
  const isEndHourDisabled = (hour: number): boolean => {
    if (!startTime.value) return false

    const startDate = new Date(startTime.value)
    const startHour = startDate.getHours()

    // 禁用小于开始时间小时的选项
    return hour < startHour
  }

  /**
   * * @description 判断结束时间的分钟是否应该被禁用
   * ? @param minute - 分钟值
   * ? @param selectedHour - 已选择的小时
   * ! @return 是否禁用
   */
  const isEndMinuteDisabled = (
    minute: number,
    selectedHour: number | null
  ): boolean => {
    if (!startTime.value || selectedHour === null) return false

    const startDate = new Date(startTime.value)
    const startHour = startDate.getHours()
    const startMinute = startDate.getMinutes()

    // 只有在选择的小时等于开始时间的小时时，才限制分钟
    if (selectedHour === startHour) {
      return minute < startMinute
    }

    return false
  }

  /**
   * * @description 判断结束时间的秒是否应该被禁用
   * ? @param second - 秒值
   * ? @param selectedMinute - 已选择的分钟
   * ? @param selectedHour - 已选择的小时
   * ! @return 是否禁用
   */
  const isEndSecondDisabled = (
    second: number,
    selectedMinute: number | null,
    selectedHour: number | null
  ): boolean => {
    if (
      !startTime.value ||
      !props.useSeconds ||
      selectedHour === null ||
      selectedMinute === null
    ) {
      return false
    }

    const startDate = new Date(startTime.value)
    const startHour = startDate.getHours()
    const startMinute = startDate.getMinutes()
    const startSecond = startDate.getSeconds()

    // 只有在选择的小时和分钟都等于开始时间时，才限制秒
    if (selectedHour === startHour && selectedMinute === startMinute) {
      return second <= startSecond
    }

    return false
  }

  /**
   * * @description 结束时间变化处理函数
   * ? @param value - 新的结束时间值
   * ! @return void
   */
  const handleEndTimeChange = (value: number | null) => {
    endTime.value = value
    emits('change-end', value)

    // 如果两个时间都有值，触发时间段改变事件
    if (props.mode === 'range') {
      emits('change-range', startTime.value, value)
    }
  }

  /**
   * * @description 单个时间变化处理函数
   * ? @param value - 新的时间值
   * ! @return void
   */
  const handleSingleTimeChange = (value: number | null) => {
    singleTime.value = value
    emits('change-single', value)
  }

  /**
   * 监听模式切换，重置时间值
   */
  watch(
    () => props.mode,
    () => {
      startTime.value = props.defaultStartTime
      endTime.value = props.defaultEndTime
      singleTime.value = props.defaultSingleTime
    }
  )

  // 在 C_Time 组件的 <script> 最后添加这些方法和暴露

  /**
   * 重置时间选择器
   */
  const reset = () => {
    startTime.value = null
    endTime.value = null
    singleTime.value = null
  }

  /**
   * 设置开始时间
   */
  const setStartTime = (time: number | null) => {
    startTime.value = time
  }

  /**
   * 设置结束时间
   */
  const setEndTime = (time: number | null) => {
    endTime.value = time
  }

  /**
   * 设置单个时间
   */
  const setSingleTime = (time: number | null) => {
    singleTime.value = time
  }

  /**
   * 获取开始时间
   */
  const getStartTime = () => startTime.value

  /**
   * 获取结束时间
   */
  const getEndTime = () => endTime.value

  /**
   * 获取单个时间
   */
  const getSingleTime = () => singleTime.value

  /**
   * 暴露组件方法给父组件
   */
  defineExpose({
    reset,
    setStartTime,
    setEndTime,
    setSingleTime,
    getStartTime,
    getEndTime,
    getSingleTime,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
