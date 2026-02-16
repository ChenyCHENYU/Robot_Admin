import type { TimePickerProps } from 'naive-ui/es'

/** 时间选择模式 */
export type TimeMode = 'range' | 'single'

/** 时间选择器 Props */
export interface TimeProps {
  mode?: TimeMode
  startPlaceholder?: string
  endPlaceholder?: string
  placeholder?: string
  format?: string
  useHours?: boolean
  useMinutes?: boolean
  useSeconds?: boolean
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  startTimeProps?: Partial<TimePickerProps>
  endTimeProps?: Partial<TimePickerProps>
  attrs?: Partial<TimePickerProps>
  defaultStartTime?: number | null
  defaultEndTime?: number | null
  defaultSingleTime?: number | null
  enableTimeRestriction?: boolean
}

/** 时间选择器 Emits */
export interface TimeEmits {
  'change-range': [startTime: number | null, endTime: number | null]
  'change-single': [time: number | null]
  'change-start': [time: number | null]
  'change-end': [time: number | null]
}

/** 时间选择器暴露方法 */
export interface TimeExpose {
  reset: () => void
  startTime: Ref<number | null>
  endTime: Ref<number | null>
  singleTime: Ref<number | null>
}
