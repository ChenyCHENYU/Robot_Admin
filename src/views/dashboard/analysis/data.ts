/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\analysis\data.ts
 * @Description: 工程分析的真实依赖分类、架构说明与图表配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import projectInfo from 'virtual:robot-admin-project-info'
import type { EChartsCoreOption } from 'echarts/core'
import type { ProjectMetrics } from '@/types/observability'
import { categoryAxis, valueAxis, formatBytes } from '../shared/d_format'
import type { StructureNode } from './components/c_structureMap/types'

export { projectInfo }
export const ecosystem = [
  ...projectInfo.dependencies,
  ...projectInfo.devDependencies,
].filter(item => item.name.startsWith('@robot-admin/'))
const visualPackages = new Set([
  'echarts',
  '@antv/x6',
  '@visactor/vtable-gantt',
  '@splinetool/runtime',
  '@iconify/vue',
  '@iconify-json/ri',
  'highlight.js',
  '@agile-team/mach-table-vue',
])
const corePackages = new Set([
  'vue',
  'vue-router',
  'pinia',
  '@vueuse/core',
  'naive-ui',
])
/** 按互斥职责分类直接依赖；连线表达分类包含关系，不代表依赖调用关系。 */
export const createDependencyNodes = (): StructureNode[] => {
  const groups = [
    {
      key: 'robot',
      label: 'Robot 生态',
      note: '业务能力与统一协议',
      items: projectInfo.dependencies.filter(item =>
        item.name.startsWith('@robot-admin/')
      ),
    },
    {
      key: 'framework',
      label: '框架与状态',
      note: '应用运行的基础',
      items: projectInfo.dependencies.filter(item =>
        corePackages.has(item.name)
      ),
    },
    {
      key: 'visual',
      label: '可视化与交互',
      note: '图表、表格与编辑体验',
      items: projectInfo.dependencies.filter(item =>
        visualPackages.has(item.name)
      ),
    },
    {
      key: 'runtime',
      label: '其他运行依赖',
      note: '网络、文件与安全能力',
      items: projectInfo.dependencies.filter(
        item =>
          !item.name.startsWith('@robot-admin/') &&
          !corePackages.has(item.name) &&
          !visualPackages.has(item.name)
      ),
    },
    {
      key: 'tooling',
      label: '开发与工程',
      note: '构建、质量与开发工具',
      items: projectInfo.devDependencies,
    },
  ]
  return groups.map(group => ({
    ...group,
    count: group.items.length,
    children: group.items.map(item => ({
      label: item.name,
      detail: item.version,
    })),
  }))
}

/** 能力域由真实菜单分组归并，每个菜单分组恰好归入一个域。 */
export const createCapabilityNodes = (
  inventory: ProjectMetrics['inventory'] | undefined
): StructureNode[] => {
  const groups = [
    {
      key: 'experiences',
      label: '组件与场景',
      note: '可复用的前端能力',
      names: ['示范组件', '插件组件', '编辑器组件', '大屏模板'],
    },
    {
      key: 'business',
      label: '业务与账户',
      note: '组织、权限与个人工作区',
      names: ['系统管理', '账户中心'],
    },
    {
      key: 'engineering',
      label: '工程与扩展',
      note: '观测、Hooks 与指令',
      names: ['仪表盘', '独立 Hooks', '自定义指令'],
    },
    {
      key: 'foundation',
      label: '应用基础',
      note: '入口、外部集成与异常状态',
      names: [],
    },
  ]
  return groups
    .map(group => {
      const routes = (inventory?.routes ?? []).filter(route =>
        group.key === 'foundation'
          ? !groups.some(item => item.names.includes(route.group.trim()))
          : group.names.includes(route.group.trim())
      )
      return {
        key: group.key,
        label: group.label,
        note: group.note,
        count: routes.reduce((sum, route) => sum + route.count, 0),
        children: routes
          .sort((a, b) => b.count - a.count)
          .map(route => ({
            label: route.group,
            detail: `${route.count} 个页面`,
          })),
      }
    })
    .filter(group => group.count > 0)
}
export const architectures = [
  {
    name: 'SPA',
    branch: 'main',
    title: '单体应用',
    description: '当前构建 · 按路由拆包与预取',
    icon: 'i-mdi:application-brackets-outline',
  },
  {
    name: 'Monorepo',
    branch: 'monorepo',
    title: '统一工作区',
    description: '多应用与共享包统一编排',
    icon: 'i-mdi:source-repository-multiple',
  },
  {
    name: 'Module Federation',
    branch: 'module-federation',
    title: '模块联邦',
    description: '运行时共享依赖与远程模块',
    icon: 'i-mdi:vector-link',
  },
  {
    name: 'MicroApp',
    branch: 'micro-app',
    title: '微前端',
    description: '主子应用集成与独立发布',
    icon: 'i-mdi:view-grid-plus-outline',
  },
]

/** 整个 JS 产物以矩形面积表示；汇总余下块，避免少量大块隐藏其他资源。 */
export const createBundleOption = (
  build: ProjectMetrics['build'] | undefined,
  compressed: boolean
): EChartsCoreOption => {
  const chunks = [...(build?.assets ?? [])]
    .filter(item => item.kind === 'js')
    .sort((a, b) =>
      compressed ? b.gzipBytes - a.gzipBytes : b.bytes - a.bytes
    )
  const top = chunks.slice(0, 18).map(item => ({
    name: item.name.replace(/^js\//, '').replace(/-[^-]+\.js$/, ''),
    value: compressed ? item.gzipBytes : item.bytes,
  }))
  const rest = chunks
    .slice(18)
    .reduce((sum, item) => sum + (compressed ? item.gzipBytes : item.bytes), 0)
  if (rest) top.push({ name: '其他 JS 产物', value: rest })
  return {
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        data: top,
        itemStyle: {
          borderWidth: 3,
          gapWidth: 3,
          borderColor: 'transparent',
          borderRadius: 5,
        },
        label: {
          formatter: (params: { name: string; value: number }) =>
            `${params.name}\n${formatBytes(params.value)}`,
          color: '#fff',
          fontSize: 11,
          lineHeight: 19,
        },
        levels: [{ itemStyle: { borderWidth: 0, gapWidth: 3 } }],
      },
    ],
  }
}

export interface BrowserPerformance {
  ttfb: number | null
  fcp: number | null
  domReady: number | null
  mounted: number | null
  resources: Array<{ name: string; duration: number; size: number }>
  stages: Array<{ name: string; start: number; duration: number }>
}

/** 文档指标来自标准 Performance API；挂载是自定义标记，不等同于 TTI。 */
const collectStages = (
  nav: PerformanceNavigationTiming | undefined,
  bootstrap: number | undefined,
  mounted: number | undefined
): BrowserPerformance['stages'] => {
  const stages: BrowserPerformance['stages'] = []
  /** 不支持或尚未结束的区间不构造测量值。 */
  const add = (
    name: string,
    start: number | undefined,
    end: number | undefined
  ) => {
    if (start !== undefined && end !== undefined && end > 0 && end >= start)
      stages.push({ name, start, duration: end - start })
  }
  add('DNS', nav?.domainLookupStart, nav?.domainLookupEnd)
  add('TCP / TLS', nav?.connectStart, nav?.connectEnd)
  add('HTML', nav?.responseStart, nav?.responseEnd)
  add('DOM Ready', nav?.responseEnd, nav?.domContentLoadedEventEnd)
  add('Vue Bootstrap', bootstrap, mounted)
  return stages
}

/** 文档指标来自标准 Performance API；挂载是自定义标记，不等同于 TTI。 */
export const readBrowserPerformance = (): BrowserPerformance => {
  const nav = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined
  const paint = performance.getEntriesByName('first-contentful-paint')[0]
  const mounted = performance.getEntriesByName('robot:mounted')[0]?.startTime
  const bootstrap = performance.getEntriesByName('robot:bootstrap-start')[0]
    ?.startTime
  const resources = (
    performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  )
    .filter(item => /\.(js|css)(?:\?|$)/.test(item.name))
    .map(item => ({
      name: new URL(item.name).pathname.split('/').at(-1) ?? '',
      duration: item.duration,
      size: item.decodedBodySize,
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 8)
  return {
    ttfb: nav ? nav.responseStart - nav.startTime : null,
    fcp: paint?.startTime ?? null,
    domReady: nav?.domContentLoadedEventEnd || null,
    mounted: mounted ?? null,
    stages: collectStages(nav, bootstrap, mounted),
    resources,
  }
}

/** 以时间原点展示交叠区间，避免将并行加载阶段错误地相加。 */
export const createWaterfallOption = (
  metrics: BrowserPerformance
): EChartsCoreOption => ({
  grid: { left: 96, right: 22, top: 16, bottom: 30 },
  xAxis: {
    ...valueAxis,
    name: 'ms',
    nameTextStyle: { color: 'inherit', fontSize: 10 },
  },
  yAxis: {
    ...categoryAxis,
    inverse: true,
    data: metrics.stages.map(stage => stage.name),
  },
  series: [
    {
      type: 'bar',
      stack: 'time',
      silent: true,
      itemStyle: { color: 'transparent' },
      emphasis: { disabled: true },
      data: metrics.stages.map(stage => stage.start),
    },
    {
      type: 'bar',
      stack: 'time',
      barMaxWidth: 22,
      data: metrics.stages.map(stage => Math.round(stage.duration)),
      itemStyle: { borderRadius: 4 },
      label: {
        show: true,
        position: 'right',
        color: 'inherit',
        fontSize: 10,
        formatter: '{c} ms',
      },
    },
  ],
})
