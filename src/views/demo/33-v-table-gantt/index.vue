<template>
  <div class="gantt-demo-page">
    <c_vTitle
      title="甘特图组件场景示例"
      icon="mdi:chart-gantt"
      description="支持任务时间线、进度跟踪、资源分配等特性，适用于项目管理、进度排程等场景"
    />

    <div class="demo-content">
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
      >
        <NTabPane
          v-for="tab in demoTabs"
          :key="tab.name"
          :name="tab.name"
          :tab="tab.label"
        >
          <div class="demo-section">
            <div class="section-header">
              <h2>{{ tab.title }}</h2>
              <p>{{ tab.description }}</p>
              <div
                v-if="tab.tips"
                class="usage-tips"
              >
                <strong>使用说明：</strong>
                <ul>
                  <li
                    v-for="tip in tab.tips"
                    :key="tip"
                    >{{ tip }}</li
                  >
                </ul>
              </div>
            </div>

            <div
              v-if="tab.controls"
              class="demo-controls"
            >
              <NButton
                v-for="control in tab.controls"
                :key="control.action"
                :type="control.type || 'default'"
                size="small"
                @click="handleAction(control.action)"
              >
                <template #icon>
                  <C_Icon
                    :name="control.icon"
                    :size="16"
                    color="currentColor"
                  />
                </template>
                {{
                  typeof control.label === 'string'
                    ? control.label
                    : control.label.value
                }}
              </NButton>
            </div>

            <C_VtableGantt
              :ref="(el: unknown) => setGanttRef(tab.name, el)"
              :data="ganttData[tab.name]"
              :preset="tab.preset"
              :title="tab.ganttTitle"
              :options="tab.options"
              :height="tab.height || '600px'"
              :theme="isDark ? 'dark' : 'light'"
              @task-click="onTaskClick"
            />
          </div>
        </NTabPane>
      </NTabs>
    </div>

    <!-- 配置说明 -->
    <div class="config-docs">
      <NCard
        title="预设配置说明"
        size="small"
      >
        <div class="config-list">
          <div
            v-for="config in presetDescriptions"
            :key="config.name"
            class="config-item"
          >
            <strong>{{ config.name }}</strong> - {{ config.description }}
            <div
              v-if="config.note"
              class="config-note"
              >{{ config.note }}</div
            >
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo33VTableGantt' })
  import type { GanttTask, GanttPreset } from '@robot-admin/naive-ui-components'
  import { VRender } from '@visactor/vtable-gantt'
  import {
    type TabConfig,
    PRESET_DESCRIPTIONS as presetDescriptions,
    createInitialData,
    createCustomOptions,
    PROJECT_OPTIONS,
  } from './data'

  // ==================== 响应式数据 ====================

  import { s_themeStore } from '@/stores/theme'

  const message = useMessage()
  const activeTab = ref('basic')
  const themeStore = s_themeStore()
  const isDark = computed(() => themeStore.isDark)
  interface GanttHandle {
    ganttInstance?: {
      collapseAll?: () => void
      expandAll?: () => void
    }
  }

  const ganttRefs = ref<Record<string, GanttHandle>>({})
  const expandStates = reactive<Record<string, boolean>>({
    basic: true,
    project: true,
  })

  // 初始化甘特图数据 - 利用类型推导
  const ganttData = ref(createInitialData())

  // ==================== 组件引用管理 ====================

  const setGanttRef = (name: string, el: unknown) => {
    if (el && typeof el === 'object' && 'ganttInstance' in el) {
      ganttRefs.value[name] = el as GanttHandle
    }
  }

  // Visactor 的 Group.add 参数类型与其导出的 Group 类型不一致，集中适配一次。
  const addGroup = (parent: VRender.Group, child: VRender.Group) =>
    parent.add(child as unknown as Parameters<VRender.Group['add']>[0])

  // ==================== 自定义布局函数 ====================

  // 任务单元格自定义布局
  const createTaskCellLayout = (barColors: string[]) => (args: any) => {
    const { table, row, col, rect } = args
    const taskRecord = table.getCellOriginRecord(col, row)
    const { height, width } = rect ?? table.getCellRect(col, row)
    const container = new VRender.Group({
      y: 10,
      x: 20,
      height: height - 20,
      width: width - 40,
      fill: 'white',
      display: 'flex',
      flexDirection: 'column',
      cornerRadius: 30,
    })

    container.add(
      new VRender.Text({
        text: taskRecord.developer,
        fontSize: 16,
        fontFamily: 'sans-serif',
        fill: barColors[args.row % barColors.length],
        fontWeight: 'bold',
        maxLineWidth: width - 120,
        boundsPadding: [10, 0, 0, 0],
        alignSelf: 'center',
      })
    )

    container.add(
      new VRender.Text({
        text: `${new Date(taskRecord.start).toLocaleDateString()}-${new Date(taskRecord.end).toLocaleDateString()}`,
        fontSize: 12,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fill: 'black',
        boundsPadding: [10, 0, 0, 0],
        alignSelf: 'center',
      })
    )

    return { rootContainer: container, expectedWidth: 160 }
  }

  // 任务条自定义布局
  const createTaskBarLayout =
    (barColors0: string[], barColors: string[]) => (args: any) => {
      const { width, height, index, taskDays, progress, taskRecord } = args
      const colorLength = barColors.length
      const container = new VRender.Group({
        width,
        height,
        cornerRadius: 30,
        fill: {
          gradient: 'linear',
          x0: 0,
          y0: 0,
          x1: 1,
          y1: 0,
          stops: [
            { offset: 0, color: barColors0[index % colorLength] },
            { offset: 0.5, color: barColors[index % colorLength] },
            { offset: 1, color: barColors0[index % colorLength] },
          ],
        },
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
      })

      // 左侧头像
      const containerLeft = new VRender.Group({
        height,
        width: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
      })
      containerLeft.add(
        new VRender.Image({
          width: 50,
          height: 50,
          image: taskRecord.avatar,
          cornerRadius: 25,
        })
      )
      addGroup(container, containerLeft)

      // 中间信息
      const containerCenter = new VRender.Group({
        height,
        width: width - (width >= 120 ? 120 : 60),
        display: 'flex',
        flexDirection: 'column',
      })

      containerCenter.add(
        new VRender.Text({
          text: taskRecord.developer,
          fontSize: 16,
          fontFamily: 'sans-serif',
          fill: 'white',
          fontWeight: 'bold',
          maxLineWidth: width - (width >= 120 ? 120 : 60),
          boundsPadding: [10, 0, 0, 0],
        })
      )

      containerCenter.add(
        new VRender.Text({
          text: `${taskDays || 1}天`,
          fontSize: 13,
          fontFamily: 'sans-serif',
          fill: 'white',
          boundsPadding: [10, 0, 0, 0],
        })
      )
      addGroup(container, containerCenter)

      // 右侧进度
      if (width >= 120) {
        const containerRight = new VRender.Group({
          cornerRadius: 20,
          fill: 'white',
          height: 40,
          width: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boundsPadding: [10, 0, 0, 0],
        })
        containerRight.add(
          new VRender.Text({
            text: `${progress || 0}%`,
            fontSize: 12,
            fontFamily: 'sans-serif',
            fill: 'black',
            alignSelf: 'center',
            fontWeight: 'bold',
            maxLineWidth: (width - 60) / 2,
            boundsPadding: [0, 0, 0, 0],
          })
        )
        addGroup(container, containerRight)
      }

      return { rootContainer: container }
    }

  // 时间轴头部自定义布局
  const createTimelineLayout = () => (args: any) => {
    const { width, height, dateIndex } = args
    const container = new VRender.Group({
      width,
      height,
      fill: '#f0f0fb',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
    })

    const containerLeft = new VRender.Group({
      height,
      width: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-around',
    })
    containerLeft.add(new VRender.Text({ text: '📅', fontSize: 16 }))
    addGroup(container, containerLeft)

    const containerCenter = new VRender.Group({
      height,
      width: width - 30,
      display: 'flex',
      flexDirection: 'column',
    })
    containerCenter.add(
      new VRender.Text({
        text: String(dateIndex).padStart(2, '0'),
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        fill: 'black',
        textAlign: 'right',
        maxLineWidth: width - 30,
        boundsPadding: [15, 0, 0, 0],
      })
    )
    addGroup(container, containerCenter)

    return { rootContainer: container }
  }

  // ==================== Tab 配置 ====================

  const demoTabs: TabConfig[] = [
    {
      name: 'basic',
      label: '基础甘特图',
      title: '基础甘特图 (preset="basic")',
      description: '简洁的基础配置，适用于简单的任务管理和项目概览。',
      preset: 'basic' as GanttPreset,
      ganttTitle: '基础项目管理',
      height: '580px',
      controls: [
        {
          action: 'addBasicTask',
          label: '添加任务',
          icon: 'carbon:add',
          type: 'primary',
        },
        {
          action: 'updateBasicProgress',
          label: '更新进度',
          icon: 'carbon:chart-line',
        },
      ],
    },
    {
      name: 'project',
      label: '项目管理',
      title: '项目管理甘特图 (preset="project")',
      description:
        '功能完整的项目管理配置，包含编辑器、优先级、行序号等专业功能。',
      preset: 'project' as GanttPreset,
      ganttTitle: '软件开发项目',
      height: '680px',
      tips: [
        '双击表格单元格可以编辑任务信息（任务名称、开始时间、结束时间、优先级、进度）',
        '拖拽任务条可以移动任务时间，支持实时调整项目进度',
        '拖拽任务条两端可以调整任务持续时间',
        '支持树形结构展示，清晰展现任务层级关系，默认展开2层',
        '点击全屏按钮进入浏览器全屏模式，按ESC键退出',
      ],
      controls: [
        {
          action: 'addProjectSubTask',
          label: '添加子任务',
          icon: 'carbon:add-alt',
          type: 'primary',
        },
        {
          action: 'updateProjectProgress',
          label: '更新进度',
          icon: 'carbon:chart-histogram',
        },
        {
          action: 'toggleProjectExpand',
          label: computed(() =>
            expandStates.project ? '收起全部' : '展开全部'
          ),
          icon: 'carbon:tree-view',
        },
      ],
      options: PROJECT_OPTIONS,
    },
    {
      name: 'timeline',
      label: '时间线',
      title: '时间线甘特图 (preset="timeline")',
      description: '适用于事件时间线、历史记录展示和重要事件跟踪。',
      preset: 'timeline' as GanttPreset,
      ganttTitle: '公司发展历程',
      height: '610px',
    },
    {
      name: 'milestone',
      label: '里程碑',
      title: '里程碑甘特图 (preset="milestone")',
      description: '专门用于重要节点和里程碑的展示，突出关键时间点。',
      preset: 'milestone' as GanttPreset,
      ganttTitle: '项目关键节点',
      height: '560px',
    },
    {
      name: 'official',
      label: '官方示例',
      title: '官方示例甘特图 (preset="official")',
      description: '完全复刻官方演示的配置和数据，展示最真实的效果和完整功能。',
      preset: 'official' as GanttPreset,
      ganttTitle: 'Official Demo',
      height: '750px',
    },
    {
      name: 'custom',
      label: '自定义渲染',
      title: '自定义渲染甘特图',
      description:
        '展示自定义渲染的强大功能，包含头像、进度、渐变色等高级视觉效果。',
      preset: 'custom' as GanttPreset,
      ganttTitle: '团队任务看板',
      height: '710px',
      options: computed(() =>
        createCustomOptions(
          createTaskCellLayout,
          createTaskBarLayout,
          createTimelineLayout
        )
      ),
    },
  ]

  // ==================== 事件处理函数 ====================

  // 统一的动作处理器
  const actionHandlers = {
    addBasicTask: () => addTask('basic'),
    updateBasicProgress: () => updateProgress('basic'),
    addProjectSubTask: () => addTask('project'),
    updateProjectProgress: () => updateProgress('project'),
    toggleProjectExpand: () => toggleExpand('project'),
  }

  const handleAction = (action: string) => {
    const handler = actionHandlers[action as keyof typeof actionHandlers]
    handler?.()
  }

  // 添加任务
  const addTask = (type: 'basic' | 'project') => {
    const newTask: GanttTask = {
      id: Date.now(),
      title: `新任务 ${Date.now()}`,
      start: type === 'basic' ? '2024-02-26' : '2024-08-16',
      end: type === 'basic' ? '2024-03-05' : '2024-08-20',
      progress: 0,
    }

    if (type === 'basic') {
      ganttData.value.basic.push(newTask)
      message.success(`添加了新任务: ${newTask.title}`)
    } else {
      const projectTask = {
        ...newTask,
        developer: '新成员',
        priority: 'P2',
      }

      ganttData.value.project[0]?.children?.push(projectTask)
      message.success(`添加了新子任务: ${projectTask.title}`)
    }
  }

  // 批量更新进度
  const updateProgress = (type: 'basic' | 'project') => {
    const increment = type === 'basic' ? 15 : 10

    const updateTaskProgress = (tasks: GanttTask[]): void => {
      tasks.forEach(task => {
        if (task.progress !== undefined && task.progress < 100) {
          task.progress = Math.min(100, task.progress + increment)
        }
        if (task.children) updateTaskProgress(task.children)
      })
    }

    updateTaskProgress(ganttData.value[type])
    message.success(`批量更新了${type === 'basic' ? '基础' : '项目'}任务进度`)
  }

  // 切换展开/收起状态
  const toggleExpand = (type: 'basic' | 'project') => {
    const ganttRef = ganttRefs.value[type]
    if (!ganttRef?.ganttInstance) {
      message.warning('甘特图实例未找到')
      return
    }

    try {
      const gantt = ganttRef.ganttInstance
      const isExpanded = expandStates[type]
      gantt[isExpanded ? 'collapseAll' : 'expandAll']?.()
      expandStates[type] = !isExpanded
      message.success(`已${isExpanded ? '收起' : '展开'}所有任务`)
    } catch (error) {
      console.warn('展开/收起操作失败:', error)
      message.warning('操作失败，请稍后重试')
    }
  }

  // ==================== 甘特图事件回调 ====================

  const onTaskClick = (task: GanttTask) => {
    message.info(`点击了任务: ${task.title}`)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
