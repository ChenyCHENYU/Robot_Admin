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
import { translateText } from '@/utils/d_i18n'
import { categoryAxis, valueAxis, formatBytes } from '../shared/d_format'

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
])
const corePackages = new Set([
  'vue',
  'vue-router',
  'pinia',
  '@vueuse/core',
  'naive-ui',
])
export const dependencyGroups = [
  {
    name: 'Robot 生态',
    value: projectInfo.dependencies.filter(item =>
      item.name.startsWith('@robot-admin/')
    ).length,
  },
  {
    name: '框架与状态',
    value: projectInfo.dependencies.filter(item => corePackages.has(item.name))
      .length,
  },
  {
    name: '可视化与交互',
    value: projectInfo.dependencies.filter(item =>
      visualPackages.has(item.name)
    ).length,
  },
  {
    name: '其他运行依赖',
    value: projectInfo.dependencies.filter(
      item =>
        !item.name.startsWith('@robot-admin/') &&
        !corePackages.has(item.name) &&
        !visualPackages.has(item.name)
    ).length,
  },
  { name: '开发与工程', value: projectInfo.devDependencies.length },
]
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

/** 环形图只表达直接依赖的数量，不借数量暗示包体积。 */
export const dependencyOption: EChartsCoreOption = {
  legend: {
    bottom: 0,
    textStyle: { color: 'inherit', fontSize: 10 },
    itemWidth: 8,
    itemHeight: 8,
  },
  series: [
    {
      type: 'pie',
      radius: ['46%', '68%'],
      center: ['50%', '43%'],
      padAngle: 3,
      label: { show: false },
      itemStyle: { borderRadius: 5 },
      data: dependencyGroups.map(group => ({
        ...group,
        name: translateText(group.name),
      })),
    },
  ],
}

/** 菜单分布基于仓库清单，与当前账号获授菜单区分。 */
export const createRouteOption = (
  inventory: ProjectMetrics['inventory'] | undefined
): EChartsCoreOption => {
  const routes = [...(inventory?.routes ?? [])].sort(
    (a, b) => b.count - a.count
  )
  return {
    grid: { left: 90, right: 25, top: 10, bottom: 22 },
    xAxis: { ...valueAxis, minInterval: 1 },
    yAxis: {
      ...categoryAxis,
      inverse: true,
      data: routes.map(item => translateText(item.group)),
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 17,
        data: routes.map(item => item.count),
        itemStyle: { borderRadius: [0, 5, 5, 0] },
        label: {
          show: true,
          position: 'right',
          color: 'inherit',
          fontSize: 10,
        },
      },
    ],
  }
}

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
