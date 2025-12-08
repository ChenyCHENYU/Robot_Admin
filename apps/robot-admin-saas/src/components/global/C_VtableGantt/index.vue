<template>
  <div class="c-vtable-gantt-wrapper">
    <div
      v-if="showToolbar"
      class="gantt-toolbar"
    >
      <div class="toolbar-left">
        <span class="gantt-title">{{ title || '甘特图' }}</span>
      </div>
      <div class="toolbar-right">
        <NButton
          v-if="showFullscreenButton"
          size="small"
          @click="toggleFullscreen"
        >
          <template #icon>
            <C_Icon
              :name="isFullscreen ? 'carbon:minimize' : 'carbon:maximize'"
              :size="16"
              color="currentColor"
            />
          </template>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </NButton>
      </div>
    </div>
    <div
      ref="ganttContainerRef"
      class="gantt-container"
      :style="{ height: containerHeight }"
    />
  </div>
</template>

<script setup lang="ts">
  // 导入数据配置
  import {
    presetConfigs,
    type GanttTask,
    type GanttOptions,
    type GanttPreset,
  } from './data'
  import { useThemeStore } from '@/stores/theme'

  interface Props {
    data?: GanttTask[]
    options?: GanttOptions
    preset?: GanttPreset
    height?: string | number
    title?: string
    showToolbar?: boolean
    showFullscreenButton?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    options: () => ({}),
    preset: 'basic',
    height: '600px',
    title: '',
    showToolbar: true,
    showFullscreenButton: true,
  })

  const emit = defineEmits<{
    ganttCreated: [gantt: any]
    taskClick: [task: GanttTask, event: Event]
    taskChange: [task: GanttTask, changes: any]
  }>()

  // 响应式数据
  const ganttContainerRef = ref<HTMLDivElement>()
  const ganttInstance = ref<any>()
  const isFullscreen = ref(false)

  const containerHeight = computed(() =>
    typeof props.height === 'number' ? `${props.height}px` : props.height
  )

  /**
   * 深度合并对象 - 支持循环引用检测
   * @param target 目标对象
   * @param source 源对象
   * @param seen WeakMap用于检测循环引用
   */
  const deepMerge = (target: any, source: any, seen = new WeakMap()): any => {
    if (!isObject(target)) return source
    if (!isObject(source)) return target
    if (seen.has(source)) return seen.get(source)

    const result = createMergeResult(target, source, seen)
    return result
  }

  /** 判断是否为对象 */
  const isObject = (value: any): boolean => {
    return value !== null && typeof value === 'object'
  }

  /** 判断是否为特殊对象(Date/RegExp等) */
  const isSpecialObject = (value: any): boolean => {
    return value instanceof Date || value instanceof RegExp
  }

  /** 创建合并结果 */
  const createMergeResult = (
    target: any,
    source: any,
    seen: WeakMap<any, any>
  ): any => {
    const result = Array.isArray(target) ? [...target] : { ...target }
    seen.set(source, result)

    for (const key in source) {
      if (!source.hasOwnProperty(key)) continue

      const sourceValue = source[key]
      const shouldDeepMerge =
        isObject(sourceValue) &&
        !Array.isArray(sourceValue) &&
        !isSpecialObject(sourceValue)

      result[key] = shouldDeepMerge
        ? deepMerge(target[key] || {}, sourceValue, seen)
        : sourceValue
    }

    return result
  }

  /** 处理任务数据格式 */
  const processData = (data: GanttTask[]): GanttTask[] => {
    return data.map(item => ({
      ...item,
      title: item.title || `任务${item.id}`,
      children: item.children ? processData(item.children) : undefined,
    }))
  }

  /** 获取主题配置 */
  const getThemeConfig = (isDark: boolean) => ({
    underlayBackgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    timelineHeaderBg: isDark ? '#2d2d2d' : '#EEF1F5',
    gridBg: isDark ? '#1e1e1e' : '#ffffff',
    lineColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(128, 128, 128, 0.2)',
    textColor: isDark ? '#ffffff' : '#000000',
  })

  /** 应用主题到时间轴配置 */
  const applyThemeToTimelineHeader = (
    timelineHeader: any,
    themeColors: any
  ) => ({
    ...timelineHeader,
    backgroundColor: themeColors.timelineHeaderBg,
    horizontalLine: {
      ...timelineHeader?.horizontalLine,
      lineColor: themeColors.lineColor,
    },
    verticalLine: {
      ...timelineHeader?.verticalLine,
      lineColor: themeColors.lineColor,
    },
    scales: timelineHeader?.scales?.map((scale: any) => ({
      ...scale,
      style: {
        ...scale.style,
        color: themeColors.textColor,
      },
    })),
  })

  /** 应用主题到网格配置 */
  const applyThemeToGrid = (grid: any, themeColors: any) => ({
    ...grid,
    backgroundColor: themeColors.gridBg,
    horizontalLine: {
      ...grid?.horizontalLine,
      lineColor: themeColors.lineColor,
    },
    verticalLine: {
      ...grid?.verticalLine,
      lineColor: themeColors.lineColor,
    },
  })

  /** 构建甘特图配置 */
  const buildGanttOptions = (
    finalConfig: any,
    processedData: GanttTask[],
    tableTheme: any,
    themeColors: any
  ) => ({
    ...finalConfig,
    records: processedData,
    underlayBackgroundColor: themeColors.underlayBackgroundColor,
    taskListTable: {
      ...finalConfig.taskListTable,
      theme: tableTheme,
    },
    timelineHeader: applyThemeToTimelineHeader(
      finalConfig.timelineHeader,
      themeColors
    ),
    grid: applyThemeToGrid(finalConfig.grid, themeColors),
  })

  /** 绑定甘特图事件 */
  const bindGanttEvents = (instance: any) => {
    instance.on('click_cell', (args: any) => {
      const { record, event } = args || {}
      if (record) emit('taskClick', record, event)
    })

    instance.on('change_data', (args: any) => {
      const { record, changes } = args || {}
      if (record && changes) emit('taskChange', record, changes)
    })
  }

  /** 初始化甘特图 */
  const initGantt = async () => {
    if (!ganttContainerRef.value) return

    try {
      const { Gantt } = await import('@visactor/vtable-gantt')
      const { themes } = await import('@visactor/vtable')
      const themeStore = useThemeStore()
      const { isDark } = themeStore

      // 准备配置
      const presetConfig = presetConfigs[props.preset] || presetConfigs.basic
      const finalConfig = deepMerge(presetConfig, props.options)
      const processedData = processData(props.data || [])

      // 释放旧实例
      if (ganttInstance.value) {
        ganttInstance.value.release()
      }

      // 应用主题
      const tableTheme = isDark ? themes.DARK : themes.DEFAULT
      const themeColors = getThemeConfig(isDark)
      const ganttOptions = buildGanttOptions(
        finalConfig,
        processedData,
        tableTheme,
        themeColors
      )

      // 创建实例
      ganttInstance.value = new Gantt(ganttContainerRef.value, ganttOptions)

      // 绑定事件
      bindGanttEvents(ganttInstance.value)

      emit('ganttCreated', ganttInstance.value)
    } catch (error) {
      console.error('甘特图初始化失败:', error)
    }
  }

  // 全屏切换
  const toggleFullscreen = async () => {
    if (!ganttContainerRef.value) return

    try {
      if (!document.fullscreenElement) {
        await ganttContainerRef.value.requestFullscreen()
        isFullscreen.value = true
      } else {
        await document.exitFullscreen()
        isFullscreen.value = false
      }

      setTimeout(() => ganttInstance.value?.resize?.(), 100)
    } catch (error) {
      console.warn('全屏切换失败:', error)
      isFullscreen.value = !isFullscreen.value
      nextTick(() => ganttInstance.value?.resize?.())
    }
  }

  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
    nextTick(() => ganttInstance.value?.resize?.())
  }

  // 更新数据
  const updateData = (newData: GanttTask[]) => {
    if (ganttInstance.value && newData) {
      try {
        const processedData = processData(newData)
        ganttInstance.value.setRecords(processedData)
      } catch (error) {
        console.warn('更新数据失败:', error)
      }
    }
  }

  // 更新配置
  const updateOptions = (newOptions: GanttOptions) => {
    if (ganttInstance.value && newOptions) {
      try {
        ganttInstance.value.updateOption(newOptions)
      } catch (error) {
        console.warn('更新配置失败:', error)
      }
    }
  }

  // 销毁甘特图
  const destroyGantt = () => {
    if (ganttInstance.value) {
      try {
        ganttInstance.value.release()
      } catch (error) {
        console.warn('销毁甘特图失败:', error)
      } finally {
        ganttInstance.value = undefined
      }
    }
  }

  // 监听变化
  watch(
    () => props.data,
    newData => {
      if (newData && ganttInstance.value) {
        updateData(newData)
      }
    },
    { deep: true }
  )

  watch(
    () => [props.options, props.preset],
    () => {
      nextTick(() => {
        initGantt()
      })
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    nextTick(() => {
      setTimeout(() => {
        initGantt()
      }, 100)
    })
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    destroyGantt()
  })

  // 监听主题变化
  const themeStore = useThemeStore()
  watch(
    () => themeStore.isDark,
    () => {
      nextTick(() => initGantt())
    }
  )

  // 暴露方法
  defineExpose({
    ganttInstance,
    updateData,
    updateOptions,
    toggleFullscreen,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
