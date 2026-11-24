/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\dashboard\analysis\browserPerformance.ts
 * @Description: 分析仪表盘的浏览器性能采样
 */
export interface BrowserPerformance {
  ttfb: number | null
  fcp: number | null
  domReady: number | null
  mounted: number | null
  resources: Array<{ name: string; duration: number; size: number }>
  stages: Array<{ name: string; start: number; duration: number }>
}

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
