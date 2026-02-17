<template>
  <div class="inline-block">
    <!-- 单日期选择 -->
    <NDatePicker
      v-if="mode === 'date'"
      v-model:value="singleDate"
      type="date"
      :placeholder="placeholder || '请选择日期'"
      :disabled="disabled"
      :is-date-disabled="singleDisabledDate"
      :value-format="valueFormat"
      clearable
      v-bind="$attrs"
      @update:value="handleSingleDateChange"
    />

    <!-- 日期时间选择 -->
    <NDatePicker
      v-else-if="mode === 'datetime'"
      v-model:value="singleDateTime"
      type="datetime"
      :placeholder="placeholder || '请选择日期时间'"
      :disabled="disabled"
      :is-date-disabled="singleDisabledDate"
      :value-format="valueFormat"
      clearable
      v-bind="$attrs"
      @update:value="handleSingleDateTimeChange"
    />

    <!-- 日期范围选择 -->
    <NDatePicker
      v-else-if="mode === 'daterange'"
      v-model:value="dateRange"
      type="daterange"
      :start-placeholder="startPlaceholder || '开始日期'"
      :end-placeholder="endPlaceholder || '结束日期'"
      :disabled="disabled"
      :is-date-disabled="singleDisabledDate"
      :value-format="valueFormat"
      clearable
      v-bind="$attrs"
      @update:value="handleDateRangeChange"
    />

    <!-- 日期时间范围选择 -->
    <NDatePicker
      v-else-if="mode === 'datetimerange'"
      v-model:value="dateTimeRange"
      type="datetimerange"
      :start-placeholder="startPlaceholder || '开始日期时间'"
      :end-placeholder="endPlaceholder || '结束日期时间'"
      :disabled="disabled"
      :is-date-disabled="singleDisabledDate"
      :value-format="valueFormat"
      clearable
      v-bind="$attrs"
      @update:value="handleDateTimeRangeChange"
    />

    <!-- 智能双日期选择（自定义逻辑） -->
    <div
      v-else-if="mode === 'smart-range'"
      class="inline-block"
    >
      <div class="flex gap-2.5 items-center">
        <NDatePicker
          class="flex-1"
          v-model:value="startDate"
          type="date"
          :placeholder="startPlaceholder || '请选择开始日期'"
          :is-date-disabled="singleDisabledDate"
          :value-format="valueFormat"
          clearable
          v-bind="startDateProps"
        />
        <NDatePicker
          class="flex-1"
          v-model:value="endDate"
          type="date"
          :placeholder="endPlaceholder || '请选择结束日期'"
          :disabled="endDateDisabled"
          :is-date-disabled="endDisabledDate"
          :value-format="valueFormat"
          clearable
          v-bind="endDateProps"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  /**
   * * @description: 日期选择器组件的模式类型
   * ? @param date 单日期选择
   * ? @param datetime 日期时间选择
   * ? @param daterange 日期范围选择
   * ? @param datetimerange 日期时间范围选择
   * ? @param smart-range 智能双日期选择（带联动限制）
   */
  type DatePickerMode =
    | 'date'
    | 'datetime'
    | 'daterange'
    | 'datetimerange'
    | 'smart-range'

  /**
   * * @description: 日期值类型定义 - 修改为与NDatePicker兼容的类型
   */
  type DateValue = number | null
  type DateRangeValue = [number, number] | null

  /**
   * * @description: 组件属性接口定义
   */
  interface Props {
    /** 日期选择器模式 */
    mode?: DatePickerMode
    /** 占位符文本（单日期模式） */
    placeholder?: string
    /** 开始日期占位符（范围模式） */
    startPlaceholder?: string
    /** 结束日期占位符（范围模式） */
    endPlaceholder?: string
    /** 是否禁用 */
    disabled?: boolean
    /** 是否禁用今天之前的日期 */
    disabledBeforeToday?: boolean
    /** 是否禁用今天之后的日期 */
    disabledAfterToday?: boolean
    /** 值格式化字符串 */
    valueFormat?: string
    /** 开始日期的额外属性（智能范围模式） */
    startDateProps?: Record<string, any>
    /** 结束日期的额外属性（智能范围模式） */
    endDateProps?: Record<string, any>
  }

  /**
   * * @description: 组件事件定义
   */
  interface Emits {
    /** 单日期变化事件 */
    (e: 'update:singleDate', value: DateValue): void
    /** 单日期时间变化事件 */
    (e: 'update:singleDateTime', value: DateValue): void
    /** 日期范围变化事件 */
    (e: 'update:dateRange', value: DateRangeValue): void
    /** 日期时间范围变化事件 */
    (e: 'update:dateTimeRange', value: DateRangeValue): void
    /** 智能范围日期变化事件 */
    (e: 'update:smartRange', value: DateRangeValue): void
    /** 通用变化事件 */
    (e: 'change', value: DateValue | DateRangeValue): void
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'date',
    placeholder: '',
    startPlaceholder: '',
    endPlaceholder: '',
    disabled: false,
    disabledBeforeToday: false,
    disabledAfterToday: false,
    valueFormat: 'yyyy-MM-dd',
    startDateProps: () => ({}),
    endDateProps: () => ({}),
  })

  const emits = defineEmits<Emits>()

  // 响应式数据
  const singleDate = ref<DateValue>(null)
  const singleDateTime = ref<DateValue>(null)
  const dateRange = ref<DateRangeValue>(null)
  const dateTimeRange = ref<DateRangeValue>(null)
  const startDate = ref<DateValue>(null)
  const endDate = ref<DateValue>(null)
  const endDateDisabled = ref(true)

  /**
   * * @description: 获取今天的时间戳（不包含时分秒）
   * ! @return {number} 今天0点的时间戳
   */
  const getTodayTimestamp = (): number => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.getTime()
  }

  /**
   * * @description: 单日期禁用判断函数
   * ? @param {number} timestamp 待判断的时间戳
   * ! @return {boolean} 是否禁用该日期
   */
  const singleDisabledDate = (timestamp: number): boolean => {
    const todayTimestamp = getTodayTimestamp()

    if (props.disabledBeforeToday && timestamp < todayTimestamp) {
      return true
    }

    if (props.disabledAfterToday && timestamp > todayTimestamp) {
      return true
    }

    return false
  }

  /**
   * * @description: 智能范围结束日期禁用判断函数
   * ? @param {number} timestamp 待判断的时间戳
   * ! @return {boolean} 是否禁用该日期
   */
  const endDisabledDate = (timestamp: number): boolean => {
    if (!startDate.value) return true

    const startTimestamp = startDate.value

    // 结束日期不能早于开始日期
    if (timestamp < startTimestamp) {
      return true
    }

    return singleDisabledDate(timestamp)
  }

  /**
   * * @description: 处理单日期变化
   * ? @param {DateValue} value 新的日期值
   */
  const handleSingleDateChange = (value: DateValue): void => {
    emits('update:singleDate', value)
    emits('change', value)
  }

  /**
   * * @description: 处理单日期时间变化
   * ? @param {DateValue} value 新的日期时间值
   */
  const handleSingleDateTimeChange = (value: DateValue): void => {
    emits('update:singleDateTime', value)
    emits('change', value)
  }

  /**
   * * @description: 处理日期范围变化
   * ? @param {DateRangeValue} value 新的日期范围值
   */
  const handleDateRangeChange = (value: DateRangeValue): void => {
    emits('update:dateRange', value)
    emits('change', value)
  }

  /**
   * * @description: 处理日期时间范围变化
   * ? @param {DateRangeValue} value 新的日期时间范围值
   */
  const handleDateTimeRangeChange = (value: DateRangeValue): void => {
    emits('update:dateTimeRange', value)
    emits('change', value)
  }

  /** 监听智能范围模式下的日期联动 */
  watch(
    () => [startDate.value, endDate.value],
    ([startVal, endVal]) => {
      if (!startVal) {
        endDate.value = null
        endDateDisabled.value = true
        return
      }

      if (startVal) {
        endDateDisabled.value = false
      }

      // 当两个日期都选择完成后，触发事件
      if (startVal && endVal) {
        const rangeValue: DateRangeValue = [startVal, endVal]
        emits('update:smartRange', rangeValue)
        emits('change', rangeValue)
      }
    },
    { deep: true }
  )

  /**
   * * @description: 对外暴露的方法和数据
   */
  defineExpose({
    singleDate,
    singleDateTime,
    dateRange,
    dateTimeRange,
    startDate,
    endDate,
    /**
     * * @description: 清空所有日期值
     */
    clearAll: () => {
      singleDate.value = null
      singleDateTime.value = null
      dateRange.value = null
      dateTimeRange.value = null
      startDate.value = null
      endDate.value = null
      endDateDisabled.value = true
    },
  })
</script>
