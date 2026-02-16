import type { TimeProps } from '@/types/modules/time'

type EmitFn = {
  (
    event: 'change-range',
    startTime: number | null,
    endTime: number | null
  ): void
  (event: 'change-single', time: number | null): void
  (event: 'change-start', time: number | null): void
  (event: 'change-end', time: number | null): void
}

/** 时间选择器逻辑 — 管理时间段/单选模式、智能限制 */
export function useTimeSelection(props: TimeProps, emit: EmitFn) {
  // ==================== 响应式状态 ====================
  const startTime = ref<number | null>(props.defaultStartTime ?? null)
  const endTime = ref<number | null>(props.defaultEndTime ?? null)
  const singleTime = ref<number | null>(props.defaultSingleTime ?? null)

  // ==================== 计算属性 ====================
  const timeFormat = computed(() => {
    if (props.useSeconds) {
      return props.format?.includes('ss') ? props.format : 'HH:mm:ss'
    }
    return props.format ?? 'HH:mm'
  })

  const endTimeDisabled = computed(
    () => props.mode === 'range' && !startTime.value
  )

  const mergedStartAttrs = computed(() => ({
    ...props.attrs,
    ...props.startTimeProps,
  }))

  const mergedEndAttrs = computed(() => ({
    ...props.attrs,
    ...props.endTimeProps,
  }))

  const mergedAttrs = computed(() => ({ ...props.attrs }))

  // ==================== 时间限制函数 ====================
  const isEndHourDisabled = (hour: number): boolean => {
    if (!startTime.value) return false
    return hour < new Date(startTime.value).getHours()
  }

  const isEndMinuteDisabled = (
    minute: number,
    selectedHour: number | null
  ): boolean => {
    if (!startTime.value || selectedHour === null) return false
    const startDate = new Date(startTime.value)
    return (
      selectedHour === startDate.getHours() && minute < startDate.getMinutes()
    )
  }

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
    )
      return false
    const startDate = new Date(startTime.value)
    return (
      selectedHour === startDate.getHours() &&
      selectedMinute === startDate.getMinutes() &&
      second <= startDate.getSeconds()
    )
  }

  // ==================== 事件处理 ====================
  const handleStartTimeChange = (value: number | null) => {
    startTime.value = value
    if (!value) {
      endTime.value = null
    } else if (
      props.enableTimeRestriction &&
      endTime.value &&
      endTime.value <= value
    ) {
      endTime.value = null
    }
    emit('change-start', value)
    if (props.mode === 'range') emit('change-range', value, endTime.value)
  }

  const handleEndTimeChange = (value: number | null) => {
    endTime.value = value
    emit('change-end', value)
    if (props.mode === 'range') emit('change-range', startTime.value, value)
  }

  const handleSingleTimeChange = (value: number | null) => {
    singleTime.value = value
    emit('change-single', value)
  }

  // ==================== 模式切换监听 ====================
  watch(
    () => props.mode,
    () => {
      startTime.value = props.defaultStartTime ?? null
      endTime.value = props.defaultEndTime ?? null
      singleTime.value = props.defaultSingleTime ?? null
    }
  )

  // ==================== 暴露方法 ====================
  const reset = () => {
    startTime.value = null
    endTime.value = null
    singleTime.value = null
  }

  return {
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
  }
}
