<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 项目计划工作台，任务查找、时间尺度和稳定详情
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace gantt-demo-page"
    ><header class="workspace-heading"
      ><div
        ><small>PROJECT PLANNING</small><h1>甘特图组件场景示例</h1
        ><p>在计划、时间线和里程碑之间切换，查找任务并查看实际排期。</p></div
      ><NTag
        size="small"
        :bordered="false"
        >改动仅保留在当前页面</NTag
      ></header
    >
    <div class="gantt-layout"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>计划视图</h2
          ><NSelect
            v-model:value="activeTab"
            :options="
              demoTabs.map(tab => ({ label: tab.label, value: tab.name }))
            "
            size="small" /></section
        ><section class="workspace-section"
          ><h2>任务目录 · {{ taskEntries.length }}</h2
          ><NInput
            v-model:value="taskSearch"
            size="small"
            clearable
            placeholder="搜索任务名称"
            :input-props="{ 'aria-label': '搜索计划任务' }"
          /><div class="gantt-task-list"
            ><button
              v-for="task in taskEntries"
              :key="task.id"
              type="button"
              class="workspace-choice"
              :aria-pressed="selectedTask?.id === task.id"
              @click="onTaskClick(task)"
              ><span
                ><strong>{{ task.title }}</strong
                ><small>{{ taskDateLabel(task.start) }}</small></span
              ></button
            ><p
              v-if="!taskEntries.length"
              class="workspace-hint"
              >没有匹配的任务</p
            ></div
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ currentTab.ganttTitle }}</h2
            ><small
              >{{ taskEntries.length }} 个可见任务 ·
              示例时间以任务明细为准</small
            ></div
          ><div class="workspace-actions"
            ><NSelect
              v-model:value="timeScale"
              :disabled="activeTab === 'custom'"
              size="small"
              :options="[
                { label: '按日查看', value: 'day' },
                { label: '按周查看', value: 'week' },
              ]"
              aria-label="计划时间尺度"
            /><NButton
              size="tiny"
              :disabled="!selectedTask || !ganttRef?.ganttInstance"
              @click="locateTask"
              >定位选中任务</NButton
            ></div
          ></header
        ><div
          v-if="currentTab.controls"
          class="gantt-actions workspace-actions"
          ><NButton
            v-for="control in currentTab.controls"
            :key="control.action"
            size="small"
            :type="control.type || 'default'"
            @click="handleAction(control.action)"
            >{{
              typeof control.label === 'string'
                ? control.label
                : control.label.value
            }}</NButton
          ></div
        ><div class="gantt-stage"
          ><C_VtableGantt
            v-if="visibleData.length"
            :key="activeTab"
            ref="ganttRef"
            :data="visibleData"
            :preset="currentTab.preset"
            :title="currentTab.ganttTitle"
            :options="workspaceOptions"
            height="540px"
            :theme="isDark ? 'dark' : 'light'"
            @task-click="onTaskClick"
            @task-change="onTaskChange"
            @error="onGanttError"
            @gantt-created="ganttError = ''"
          /><div
            v-else
            class="workspace-empty"
            >没有匹配的任务，清空搜索后恢复计划视图。</div
          ></div
        ><footer class="workspace-footer"
          ><span>{{
            ganttError
              ? '加载失败，可在图内重试'
              : '双击可编辑字段 · 拖动任务条调整排期'
          }}</span
          ><span>日期、进度与详情使用同一份任务记录</span></footer
        ></main
      >
      <aside class="workspace-panel gantt-inspector"
        ><section class="workspace-section"
          ><h2>任务详情</h2
          ><template v-if="selectedTask"
            ><h3>{{ selectedTask.title }}</h3
            ><dl
              ><dt>开始</dt><dd>{{ taskDateLabel(selectedTask.start) }}</dd
              ><dt>结束</dt><dd>{{ taskDateLabel(selectedTask.end) }}</dd
              ><dt>完成进度</dt><dd>{{ selectedTask.progress ?? 0 }}%</dd
              ><dt>优先级</dt
              ><dd>{{ selectedTask.priority ?? '未设置' }}</dd></dl
            ></template
          ><NEmpty
            v-else
            description="从任务目录或时间线选择一项" /></section
        ><section class="workspace-section"
          ><NCollapse
            ><NCollapseItem
              title="场景与操作说明"
              name="guide"
              ><p>{{ currentTab.description }}</p
              ><p
                v-for="tip in currentTab.tips"
                :key="tip"
                >{{ tip }}</p
              ><p
                v-for="config in presetDescriptions"
                :key="config.name"
                ><strong>{{ config.name }}</strong> ·
                {{ config.description }}</p
              ></NCollapseItem
            ></NCollapse
          ></section
        ></aside
      ></div
    >
  </div>
</template>
<script setup lang="ts">
  defineOptions({ name: 'Demo33VTableGantt' })
  import {
    appendGanttGroup,
    type GanttExpose,
    type GanttOptions,
    type GanttTaskChanges,
    type GanttTaskCellLayout,
    type GanttTaskBarLayout,
    type GanttTimelineLayout,
  } from '@robot-admin/naive-ui-components/C_VtableGantt'
  import { VRender } from '@visactor/vtable-gantt'
  import {
    type TabConfig,
    type DemoGanttTask,
    PRESET_DESCRIPTIONS as presetDescriptions,
    createInitialData,
    createCustomOptions,
    PROJECT_OPTIONS,
  } from './data'

  // ==================== 响应式数据 ====================

  import { s_themeStore } from '@/stores/theme'

  const message = useMessage()
  const activeTab = ref('project')
  const taskSearch = ref('')
  const timeScale = ref<'week' | 'day'>('week')
  const selectedTask = shallowRef<DemoGanttTask | null>(null)
  const ganttError = ref('')
  const themeStore = s_themeStore()
  const isDark = computed(() => themeStore.isDark)
  const ganttRef = shallowRef<GanttExpose<DemoGanttTask> | null>(null)
  const expandStates = reactive<Record<string, boolean>>({
    basic: true,
    project: true,
  })

  // 初始化甘特图数据 - 利用类型推导
  const ganttData = ref(createInitialData())

  // ==================== 自定义布局函数 ====================

  // 任务单元格自定义布局
  const createTaskCellLayout =
    (barColors: string[]): GanttTaskCellLayout<DemoGanttTask> =>
    args => {
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

      if (!taskRecord) {
        return { rootContainer: container, renderDefault: true }
      }

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
          text: `${new Date(taskRecord.start).toLocaleDateString()}-${new Date(taskRecord.end ?? taskRecord.start).toLocaleDateString()}`,
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
    (
      barColors0: string[],
      barColors: string[]
    ): GanttTaskBarLayout<DemoGanttTask> =>
    args => {
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
      appendGanttGroup(container, containerLeft)

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
      appendGanttGroup(container, containerCenter)

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
        appendGanttGroup(container, containerRight)
      }

      return { rootContainer: container }
    }

  // 时间轴头部自定义布局
  const createTimelineLayout = (): GanttTimelineLayout => args => {
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
    appendGanttGroup(container, containerLeft)

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
    appendGanttGroup(container, containerCenter)

    return { rootContainer: container }
  }

  // ==================== Tab 配置 ====================

  const demoTabs: TabConfig[] = [
    {
      name: 'basic',
      label: '基础甘特图',
      title: '基础甘特图 (preset="basic")',
      description: '简洁的基础配置，适用于简单的任务管理和项目概览。',
      preset: 'basic',
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
      preset: 'project',
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
      preset: 'timeline',
      ganttTitle: '公司发展历程',
      height: '610px',
    },
    {
      name: 'milestone',
      label: '里程碑',
      title: '里程碑甘特图 (preset="milestone")',
      description: '专门用于重要节点和里程碑的展示，突出关键时间点。',
      preset: 'milestone',
      ganttTitle: '项目关键节点',
      height: '560px',
    },
    {
      name: 'official',
      label: '官方示例',
      title: '官方示例甘特图 (preset="official")',
      description: '完全复刻官方演示的配置和数据，展示最真实的效果和完整功能。',
      preset: 'official',
      ganttTitle: 'Official Demo',
      height: '750px',
    },
    {
      name: 'custom',
      label: '自定义渲染',
      title: '自定义渲染甘特图',
      description:
        '展示自定义渲染的强大功能，包含头像、进度、渐变色等高级视觉效果。',
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

  const currentTab = computed(
    () => demoTabs.find(tab => tab.name === activeTab.value) ?? demoTabs[0]
  )
  const taskEntries = computed(() => {
    const result: DemoGanttTask[] = []
    const visit = (tasks: DemoGanttTask[]) =>
      tasks.forEach(task => {
        result.push(task)
        if (task.children) visit(task.children)
      })
    visit(ganttData.value[activeTab.value] ?? [])
    return result.filter(task =>
      task.title.toLowerCase().includes(taskSearch.value.trim().toLowerCase())
    )
  })
  const filterTasks = (tasks: DemoGanttTask[]): DemoGanttTask[] =>
    tasks.flatMap(task => {
      if (
        task.title.toLowerCase().includes(taskSearch.value.trim().toLowerCase())
      )
        return [task]
      const children = task.children ? filterTasks(task.children) : []
      return children.length ? [{ ...task, children }] : []
    })
  const visibleData = computed(() =>
    filterTasks(ganttData.value[activeTab.value] ?? [])
  )
  const workspaceOptions = computed<GanttOptions<DemoGanttTask>>(() => {
    const base = unref(currentTab.value.options) ?? {}
    if (currentTab.value.name === 'custom') return base
    return {
      ...base,
      taskListTable: {
        ...base.taskListTable,
        tableWidth: 400,
        hierarchyExpandLevel: expandStates.project ? 99 : 1,
        theme: {
          headerStyle: { fontSize: 12, fontWeight: 'normal' },
          bodyStyle: { fontSize: 12 },
        },
      },
      taskBar: {
        ...base.taskBar,
        labelTextStyle: {
          color: '#ffffff',
          fontSize: 11,
          textAlign: 'left',
          textOverflow: 'ellipsis',
        },
        barStyle: {
          width: 22,
          barColor: '#9cb8ec',
          completedBarColor: '#5686d4',
          cornerRadius: 5,
          borderLineWidth: 0,
        },
      },
      timelineHeader: {
        ...base.timelineHeader,
        colWidth: timeScale.value === 'week' ? 90 : 52,
        scales: [
          {
            unit: timeScale.value,
            step: 1,
            format: date =>
              timeScale.value === 'week'
                ? `第 ${date.dateIndex} 周`
                : String(date.dateIndex),
            style: { fontSize: 11, fontWeight: 'normal' },
          },
        ],
      },
    }
  })
  const taskDateLabel = (value: string | Date | undefined) =>
    value instanceof Date
      ? value.toLocaleDateString('zh-CN')
      : (value ?? '未设置')
  const locateTask = () => {
    if (!selectedTask.value) return
    const date = new Date(selectedTask.value.start)
    if (Number.isFinite(date.getTime()))
      ganttRef.value?.ganttInstance?.scrollToMarkLine(date)
  }
  watch(activeTab, () => {
    selectedTask.value = null
    taskSearch.value = ''
    ganttError.value = ''
  })

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
    const newTask: DemoGanttTask = {
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

    const updateTaskProgress = (tasks: DemoGanttTask[]): void => {
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
    const gantt = ganttRef.value?.ganttInstance
    if (!gantt || activeTab.value !== type) {
      message.warning('甘特图实例未找到')
      return
    }

    try {
      const isExpanded = expandStates[type]
      const table = gantt.taskListTableInstance
      if (!table) {
        message.warning('任务表尚未就绪')
        return
      }
      if (isExpanded) table.collapseAllTreeNode()
      else table.expandAllTreeNode()
      expandStates[type] = !isExpanded
      message.success(`已${isExpanded ? '收起' : '展开'}所有任务`)
    } catch (error) {
      console.warn('展开/收起操作失败:', error)
      message.warning('操作失败，请稍后重试')
    }
  }

  const onTaskChange = (
    task: DemoGanttTask,
    changes: GanttTaskChanges<DemoGanttTask>
  ) => {
    const visit = (tasks: DemoGanttTask[]) =>
      tasks.forEach(item => {
        if (String(item.id) === String(task.id)) Object.assign(item, changes)
        if (item.children) visit(item.children)
      })
    visit(ganttData.value[activeTab.value] ?? [])
    if (selectedTask.value?.id === task.id)
      selectedTask.value = { ...task, ...changes }
  }

  // ==================== 甘特图事件回调 ====================

  const onTaskClick = (task: DemoGanttTask) => {
    selectedTask.value = task
  }

  /** 失败状态交给图内重试入口恢复，页面动作不再操作已释放实例。 */
  const onGanttError = (error: Error) => {
    ganttError.value = error.message
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
