import type {
  GanttTask,
  GanttOptions,
  GanttPreset,
} from '@/components/global/C_VtableGantt/data'

// ==================== 基础类型定义 ====================

export interface TabConfig {
  name: string
  label: string
  title: string
  description: string
  preset: GanttPreset
  ganttTitle: string
  height?: string
  tips?: string[]
  controls?: ControlConfig[]
  options?: GanttOptions
}

export interface ControlConfig {
  action: string
  label: string | any // 支持响应式数据
  icon: string
  type?: string
}

export interface PresetDescription {
  name: string
  description: string
  note?: string
}

// 简化自定义布局类型 - 利用类型推导
export type CustomLayoutFunction = (args: any) => {
  rootContainer: any
  expectedWidth?: number
}

export type CreateTaskCellLayoutFunction = (
  colors: string[]
) => CustomLayoutFunction
export type CreateTaskBarLayoutFunction = (
  colors0: string[],
  colors: string[]
) => CustomLayoutFunction
export type CreateTimelineLayoutFunction = () => CustomLayoutFunction

// ==================== 常量配置 ====================

// 颜色配置 - 移除 as const，让其可变
export const GANTT_COLORS = {
  BAR_LIGHT: [
    '#aecde6',
    '#c6a49a',
    '#ffb582',
    '#eec1de',
    '#b3d9b3',
    '#cccccc',
    '#e59a9c',
    '#d9d1a5',
    '#c9bede',
  ],
  BAR_DARK: [
    '#1f77b4',
    '#8c564b',
    '#ff7f0e',
    '#e377c2',
    '#2ca02c',
    '#7f7f7f',
    '#d62728',
    '#bcbd22',
    '#9467bd',
  ],
  BACKGROUND: '#f0f0fb',
  BORDER: '#e1e4e8',
  GRID_LINE: '#d5d9ee',
}

// 日期常量
export const DATE_CONSTANTS = {
  PROJECT_START: '2024-07-20',
  PROJECT_END: '2024-08-15',
  BASE_YEAR: 2024,
  BASE_MONTH: 7,
  BASE_DAY: 24,
}

// 布局常量
export const LAYOUT_CONSTANTS = {
  HEADER_ROW_HEIGHT: 60,
  ROW_HEIGHT: 80,
  TASK_BAR_WIDTH: 60,
  TIMELINE_COL_WIDTH: 80,
  TASK_COLUMN_WIDTH: 200,
}

export const DEFAULT_DEVELOPER = 'liufangfang.jane@bytedance.com'
export const CUSTOM_RENDER_BASE_URL =
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/custom-render/'

// ==================== 预设说明配置 ====================

export const PRESET_DESCRIPTIONS = [
  {
    name: 'basic',
    description: '基础配置，简洁易用，适合快速开始和轻量级项目管理',
  },
  {
    name: 'project',
    description: '项目管理配置，功能丰富，支持编辑、排序、优先级等',
    note: '• 双击单元格编辑 • 拖拽任务条移动/调整大小 • 树形结构展现层级关系 • 默认展开2层',
  },
  {
    name: 'timeline',
    description: '时间线配置，适合事件展示和历史记录',
  },
  {
    name: 'milestone',
    description: '里程碑配置，专门展示重要节点',
  },
  {
    name: 'official',
    description: '官方示例配置，完全复刻官方demo，默认展开2层',
  },
  {
    name: 'custom',
    description: '自定义渲染，展示高级customLayout功能',
  },
]

// ==================== 工具函数 ====================

/**
 * 格式化日期为字符串
 */
const formatDate = (year: number, month: number, day: number) =>
  `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

/**
 * 计算日期偏移
 */
const getDateWithOffset = (baseDate: string, offset: number) => {
  const date = new Date(baseDate)
  date.setDate(date.getDate() + offset)
  return formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

/**
 * 创建任务的工厂函数 - 利用类型推导
 */
const createTask = (config: {
  id: number
  title: string
  start: string
  end?: string
  progress?: number
  priority?: string
  type?: 'milestone' | 'task'
  developer?: string
  avatar?: string
  children?: GanttTask[]
}): GanttTask => {
  const task: GanttTask = {
    id: config.id,
    title: config.title,
    start: config.start,
  }

  // 动态添加属性，让 TypeScript 自动推导
  if (config.end) task.end = config.end
  if (config.progress !== undefined) task.progress = config.progress
  if (config.priority) (task as any).priority = config.priority
  if (config.type) task.type = config.type
  if (config.developer) (task as any).developer = config.developer
  if (config.avatar) (task as any).avatar = config.avatar
  if (config.children) task.children = config.children

  return task
}

// ==================== 数据创建函数 ====================

/**
 * 创建基础甘特图数据
 */
export const createBasicData = (): GanttTask[] => {
  const baseDate = formatDate(DATE_CONSTANTS.BASE_YEAR, 1, 1)

  return [
    createTask({
      id: 1,
      title: '项目启动',
      start: baseDate,
      end: getDateWithOffset(baseDate, 4),
      progress: 100,
    }),
    createTask({
      id: 2,
      title: '需求分析',
      start: getDateWithOffset(baseDate, 5),
      end: getDateWithOffset(baseDate, 14),
      progress: 80,
    }),
    createTask({
      id: 3,
      title: '系统设计',
      start: getDateWithOffset(baseDate, 15),
      end: getDateWithOffset(baseDate, 24),
      progress: 60,
    }),
    createTask({
      id: 4,
      title: '开发实现',
      start: getDateWithOffset(baseDate, 25),
      end: getDateWithOffset(baseDate, 45),
      progress: 30,
    }),
    createTask({
      id: 5,
      title: '测试验收',
      start: getDateWithOffset(baseDate, 46),
      end: getDateWithOffset(baseDate, 55),
      progress: 0,
    }),
  ]
}

/**
 * 创建项目管理甘特图数据
 */
export const createProjectData = (): GanttTask[] => [
  createTask({
    id: 1,
    title: '软件开发项目',
    developer: '张三',
    start: '2024-07-24',
    end: '2024-08-15',
    progress: 31,
    priority: 'P0',
    children: [
      createTask({
        id: 2,
        title: '项目需求评审',
        developer: '李四',
        start: '2024-07-24',
        end: '2024-07-26',
        progress: 100,
        priority: 'P0',
      }),
      createTask({
        id: 3,
        title: '确定项目范围',
        developer: '王五',
        start: '2024-07-27',
        end: '2024-07-29',
        progress: 100,
        priority: 'P1',
      }),
      createTask({
        id: 4,
        title: '功能开发',
        developer: '赵六',
        start: '2024-08-01',
        end: '2024-08-15',
        progress: 0,
        priority: 'P1',
      }),
    ],
  }),
  createTask({
    id: 5,
    title: '测试验收',
    developer: '钱七',
    start: '2024-08-10',
    end: '2024-08-20',
    progress: 60,
    priority: 'P0',
  }),
]

/**
 * 创建时间线甘特图数据
 */
export const createTimelineData = (): GanttTask[] => [
  createTask({
    id: 1,
    title: '公司成立',
    start: '2020-01-15',
    end: '2020-01-15',
    type: 'milestone',
  }),
  createTask({
    id: 2,
    title: '第一轮融资',
    start: '2020-06-01',
    end: '2020-08-31',
    progress: 100,
  }),
  createTask({
    id: 3,
    title: '产品上线',
    start: '2021-03-01',
    end: '2021-03-01',
    type: 'milestone',
  }),
  createTask({
    id: 4,
    title: '市场推广',
    start: '2021-04-01',
    end: '2021-12-31',
    progress: 85,
  }),
  createTask({
    id: 5,
    title: '第二轮融资',
    start: '2022-01-01',
    end: '2022-03-31',
    progress: 100,
  }),
]

/**
 * 创建里程碑甘特图数据
 */
export const createMilestoneData = (): GanttTask[] => {
  const milestones = [
    { title: '项目启动会', date: '2024-01-01', priority: '高' },
    { title: 'Alpha版本发布', date: '2024-02-15', priority: '高' },
    { title: 'Beta版本发布', date: '2024-04-01', priority: '中' },
    { title: '正式版发布', date: '2024-06-01', priority: '高' },
    { title: '用户培训完成', date: '2024-07-15', priority: '中' },
  ]

  return milestones.map((milestone, index) =>
    createTask({
      id: index + 1,
      title: milestone.title,
      start: milestone.date,
      priority: milestone.priority,
      type: 'milestone',
    })
  )
}

/**
 * 创建官方示例数据
 */
export const createOfficialData = (): GanttTask[] => [
  createTask({
    id: 1,
    title: 'Software Development',
    developer: DEFAULT_DEVELOPER,
    start: '2024-07-24',
    end: '2024-08-15',
    progress: 31,
    priority: 'P0',
    children: [
      createTask({
        id: 2,
        title: 'Project Feature Review',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-24',
        end: '2024-07-24',
        progress: 60,
        priority: 'P0',
      }),
      createTask({
        id: 3,
        title: 'Determine project scope',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-25',
        end: '2024-07-26',
        progress: 100,
        priority: 'P1',
      }),
      createTask({
        id: 4,
        title: 'Project Create',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-27',
        end: '2024-07-27',
        progress: 100,
        priority: 'P1',
        type: 'milestone',
      }),
      createTask({
        id: 5,
        title: 'Develop feature 1',
        developer: DEFAULT_DEVELOPER,
        start: '2024-08-01',
        end: '2024-08-15',
        progress: 0,
        priority: 'P1',
      }),
    ],
  }),
  createTask({
    id: 6,
    title: 'Scope Planning',
    developer: DEFAULT_DEVELOPER,
    start: '2024-07-24',
    end: '2024-08-04',
    progress: 60,
    priority: 'P0',
  }),
  createTask({
    id: 7,
    title: 'Architecture Design',
    developer: DEFAULT_DEVELOPER,
    start: '2024-07-24',
    end: '2024-08-04',
    progress: 100,
    priority: 'P1',
    children: [
      createTask({
        id: 8,
        title: 'Database Design',
        developer: DEFAULT_DEVELOPER,
        start: '2024-08-01',
        end: '2024-08-01',
        progress: 90,
        priority: 'P0',
      }),
      createTask({
        id: 9,
        title: 'API Design',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-30',
        end: '2024-08-04',
        progress: 31,
        priority: 'P0',
      }),
      createTask({
        id: 10,
        title: 'UI Framework',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-26',
        end: '2024-07-28',
        progress: 60,
        priority: 'P0',
      }),
    ],
  }),
  createTask({
    id: 11,
    title: 'Milestone Review',
    developer: DEFAULT_DEVELOPER,
    start: '2024-07-29',
    type: 'milestone',
  }),
  createTask({
    id: 12,
    title: 'Testing Phase',
    developer: DEFAULT_DEVELOPER,
    start: '2024-07-26',
    end: '2024-07-28',
    progress: 60,
    priority: 'P0',
    children: [
      createTask({
        id: 13,
        title: 'Unit Testing',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-29',
        end: '2024-07-31',
        progress: 100,
        priority: 'P1',
      }),
      createTask({
        id: 14,
        title: 'Integration Testing',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-24',
        end: '2024-08-04',
        progress: 31,
        priority: 'P0',
      }),
      createTask({
        id: 15,
        title: 'Performance Testing',
        developer: DEFAULT_DEVELOPER,
        start: '2024-07-26',
        end: '2024-07-28',
        progress: 60,
        priority: 'P0',
      }),
    ],
  }),
]

/**
 * 创建自定义渲染数据
 */
export const createCustomData = (): GanttTask[] => {
  const animalConfigs = [
    { name: 'bear', dev: 'bear.xiong', ext: 'jpg' },
    { name: 'wolf', dev: 'wolf.lang', ext: 'jpg' },
    { name: 'rabbit', dev: 'rabbit.tu', ext: 'jpg' },
    { name: 'cat', dev: 'cat.mao', ext: 'jpg' },
    { name: 'bird', dev: 'bird.niao', ext: 'jpeg' },
    { name: 'flower', dev: 'flower.hua', ext: 'jpg' },
  ]

  return animalConfigs.map((animal, index) =>
    createTask({
      id: index + 1,
      title: `Project Task ${index + 1}`,
      developer: animal.dev,
      avatar: `${CUSTOM_RENDER_BASE_URL}${animal.name}.${animal.ext}`,
      start: formatDate(
        2024,
        7,
        DATE_CONSTANTS.BASE_DAY + Math.floor(index * 1.5)
      ),
      end: formatDate(2024, 8, Math.min(10, 1 + Math.floor(index * 1.5))),
      progress: index % 3 === 2 ? 100 : index % 3 === 1 ? 60 : 31,
      priority: index % 2 === 0 ? 'P0' : 'P1',
    })
  )
}

// ==================== 数据工厂 ====================

// 数据创建器映射
const dataCreators = {
  basic: createBasicData,
  project: createProjectData,
  timeline: createTimelineData,
  milestone: createMilestoneData,
  official: createOfficialData,
  custom: createCustomData,
}

/**
 * 创建所有甘特图初始数据
 */
export const createInitialData = () => {
  const result: Record<string, GanttTask[]> = {}
  Object.entries(dataCreators).forEach(([key, creator]) => {
    result[key] = creator()
  })
  return result
}

/**
 * 根据类型创建特定的甘特图数据
 */
export const createDataByType = (type: keyof typeof dataCreators) => {
  const creator = dataCreators[type]
  if (!creator) {
    throw new Error(`Unsupported data type: ${type}`)
  }
  return creator()
}

// ==================== 自定义配置函数 ====================

/**
 * 创建自定义甘特图配置
 */
export const createCustomOptions = (
  createTaskCellLayout: CreateTaskCellLayoutFunction,
  createTaskBarLayout: CreateTaskBarLayoutFunction,
  createTimelineLayout: CreateTimelineLayoutFunction
): GanttOptions => ({
  overscrollBehavior: 'none',
  headerRowHeight: LAYOUT_CONSTANTS.HEADER_ROW_HEIGHT,
  rowHeight: LAYOUT_CONSTANTS.ROW_HEIGHT,
  minDate: DATE_CONSTANTS.PROJECT_START,
  maxDate: DATE_CONSTANTS.PROJECT_END,
  taskListTable: {
    columns: [
      {
        field: 'title',
        title: 'TASK',
        width: LAYOUT_CONSTANTS.TASK_COLUMN_WIDTH,
        headerStyle: {
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: 'black',
          bgColor: GANTT_COLORS.BACKGROUND,
        },
        style: { bgColor: GANTT_COLORS.BACKGROUND },
        customLayout: createTaskCellLayout(GANTT_COLORS.BAR_DARK),
      },
    ],
    tableWidth: 'auto',
    theme: {
      headerStyle: {
        borderColor: GANTT_COLORS.BORDER,
        borderLineWidth: 0,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
      },
      bodyStyle: {
        borderColor: GANTT_COLORS.BORDER,
        borderLineWidth: 0,
        fontSize: 16,
        color: '#4D4D4D',
        bgColor: '#FFF',
      },
    },
  },
  frame: {
    outerFrameStyle: {
      borderLineWidth: 0,
      borderColor: 'red',
      cornerRadius: 8,
    },
  },
  grid: {
    backgroundColor: GANTT_COLORS.BACKGROUND,
    horizontalLine: {
      lineWidth: 2,
      lineColor: GANTT_COLORS.GRID_LINE,
    },
  },
  taskBar: {
    startDateField: 'start',
    endDateField: 'end',
    progressField: 'progress',
    barStyle: { width: LAYOUT_CONSTANTS.TASK_BAR_WIDTH },
    customLayout: createTaskBarLayout(
      GANTT_COLORS.BAR_LIGHT,
      GANTT_COLORS.BAR_DARK
    ),
    hoverBarStyle: { cornerRadius: 30 },
  },
  timelineHeader: {
    backgroundColor: GANTT_COLORS.BACKGROUND,
    colWidth: LAYOUT_CONSTANTS.TIMELINE_COL_WIDTH,
    scales: [
      {
        unit: 'day' as const,
        step: 1,
        format: (date: any) => date.dateIndex.toString(),
        customLayout: createTimelineLayout(),
      },
    ],
  },
  markLine: [
    {
      date: '2024-07-29',
      style: { lineWidth: 1, lineColor: 'blue', lineDash: [8, 4] },
    },
    {
      date: '2024-08-17',
      style: { lineWidth: 2, lineColor: 'red', lineDash: [8, 4] },
    },
  ],
  scrollStyle: {
    scrollRailColor: 'RGBA(246,246,246,0.5)',
    visible: 'focus',
    width: 6,
    scrollSliderCornerRadius: 2,
    scrollSliderColor: '#5cb85c',
  },
})

// ==================== 项目配置 ====================

/**
 * 项目管理甘特图的额外配置
 */
export const PROJECT_OPTIONS: GanttOptions = {
  markLine: [
    {
      date: '2024-08-01',
      style: {
        lineWidth: 2,
        lineColor: '#ff4d4f',
        lineDash: [5, 5],
      },
    },
  ],
}

// ==================== 向后兼容导出 ====================

export const barColors0 = GANTT_COLORS.BAR_LIGHT
export const barColors = GANTT_COLORS.BAR_DARK
export const presetDescriptions = PRESET_DESCRIPTIONS
export const projectOptions = PROJECT_OPTIONS
