<template>
  <!--
    进度条组件主容器
    使用NaiveUI的NProgress组件作为基础
    支持多种进度条类型和动画效果
  -->
  <NProgress
    v-bind="progressProps"
    :percentage="processedPercentage"
    :processing="isAnimation"
  >
    <!--
      自定义指示器插槽
      当showIndicator为true且提供了indicator插槽时显示
    -->
    <template
      v-if="showIndicator && hasIndicatorSlot"
      #default
    >
      <slot name="indicator" />
    </template>
  </NProgress>
</template>

<script lang="ts" setup>
  // 导入Vue的类型定义
  import type { CSSProperties } from 'vue'

  /**
   * CSS样式类型定义
   * 可以是CSSProperties对象或字符串形式的CSS
   */
  type CSS = CSSProperties | string

  /**
   * 组件属性接口
   * 定义了进度条组件所有可配置的props
   */
  interface Props {
    // ========== 基础配置 ==========
    /**
     * 进度值，支持数字或数组形式
     * - 数字: 用于单进度条
     * - 数组: 用于多圆环类型(multiple-circle)
     */
    percentage: number | number[]
    /**
     * 是否启用动画效果
     * @default false
     */
    isAnimation?: boolean
    /**
     * 动画持续时间(毫秒)
     * @default 3000
     */
    time?: number
    /**
     * 进度条类型
     * @default 'line'
     * @value 'line' - 线性进度条
     * @value 'circle' - 圆形进度条
     * @value 'multiple-circle' - 多圆环进度条
     * @value 'dashboard' - 仪表盘式进度条
     */
    type?: 'line' | 'circle' | 'multiple-circle' | 'dashboard'

    // ========== 样式配置 ==========
    /**
     * 进度条圆角半径
     */
    borderRadius?: number | string
    /**
     * 圆环之间的间隙(仅多圆环类型有效)
     */
    circleGap?: number
    /**
     * 进度条颜色，支持多种格式：
     * - 字符串: 单一颜色
     * - 数组: 多个颜色(用于多圆环)
     * - 对象: 渐变色配置
     */
    color?: string | string[] | { stops: string[] } | Array<{ stops: string[] }>
    /**
     * 填充部分的圆角半径
     */
    fillBorderRadius?: number | string
    /**
     * 缺口角度(仅仪表盘类型有效)
     */
    gapDegree?: number
    /**
     * 缺口偏移角度(仅仪表盘类型有效)
     */
    gapOffsetDegree?: number
    /**
     * 进度条高度(仅线形类型有效)
     */
    height?: number
    /**
     * 进度指示器位置
     * @default 'outside'
     */
    indicatorPlacement?: 'inside' | 'outside'
    /**
     * 指示器文本颜色
     */
    indicatorTextColor?: string
    /**
     * 偏移角度
     */
    offsetDegree?: number
    /**
     * 轨道背景颜色
     */
    railColor?: string | string[]
    /**
     * 轨道样式，支持CSS字符串或对象
     */
    railStyle?: string | CSS | Array<string | CSS>
    /**
     * 是否显示进度指示器
     * @default true
     */
    showIndicator?: boolean
    /**
     * 进度条状态
     * @default 'default'
     */
    status?: 'default' | 'success' | 'error' | 'warning' | 'info'
    /**
     * 进度条宽度/圆环厚度
     * @default 7
     */
    strokeWidth?: number
    /**
     * 进度单位
     * @default '%'
     */
    unit?: string
  }

  // 定义组件props并设置默认值
  const props = withDefaults(defineProps<Props>(), {
    percentage: 0,
    isAnimation: false,
    time: 3000,
    indicatorPlacement: 'outside',
    showIndicator: true,
    status: 'default',
    strokeWidth: 7,
    unit: '%',
  })

  // 获取插槽信息和内部进度值
  const slots = useSlots()
  const p = ref<number | number[]>(
    Array.isArray(props.percentage) ? [...props.percentage] : 0
  )

  // 计算属性：检查是否有自定义指示器插槽
  const hasIndicatorSlot = computed(() => !!slots.indicator)

  /**
   * * 处理后的进度值
   * * 根据类型返回适当格式的值
   */
  const processedPercentage = computed(() => {
    return props.type === 'multiple-circle'
      ? Array.isArray(p.value)
        ? p.value
        : [p.value]
      : Array.isArray(p.value)
        ? p.value[0]
        : p.value
  })

  /**
   * * 合并后的进度条属性
   * * 将分散的props合并为传递给NProgress组件的对象
   */
  const progressProps = computed(() => ({
    type: props.type,
    borderRadius: props.borderRadius,
    circleGap: props.circleGap,
    color: props.color,
    fillBorderRadius: props.fillBorderRadius,
    gapDegree: props.gapDegree,
    gapOffsetDegree: props.gapOffsetDegree,
    height: props.height,
    indicatorPlacement: props.indicatorPlacement,
    indicatorTextColor: props.indicatorTextColor,
    offsetDegree: props.offsetDegree,
    railColor: props.railColor,
    railStyle: props.railStyle,
    status: props.status,
    strokeWidth: props.strokeWidth,
    unit: props.unit,
  }))

  /**
   * * 监听percentage变化并同步值
   */
  watch(
    () => props.percentage,
    newVal => {
      if (!props.isAnimation) {
        p.value = newVal
      } else if (props.type === 'multiple-circle' && Array.isArray(newVal)) {
        p.value = [...newVal]
      }
    },
    { immediate: true, deep: true }
  )

  /**
   * * 组件挂载后执行动画(仅非多圆环类型)
   */
  onMounted(() => {
    if (props.isAnimation && props.type !== 'multiple-circle') {
      const targetValue = Array.isArray(props.percentage)
        ? props.percentage[0]
        : props.percentage

      if (targetValue > 0) {
        const stepTime = props.time / targetValue
        let currentStep = 0

        const timer = setInterval(() => {
          currentStep += 1
          if (currentStep >= targetValue) {
            p.value = targetValue
            clearInterval(timer)
          } else {
            p.value = currentStep
          }
        }, stepTime)
      }
    }
  })
</script>
