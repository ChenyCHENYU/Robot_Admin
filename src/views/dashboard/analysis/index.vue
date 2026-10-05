<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\dashboard\analysis\index.vue
 * @Description: 项目工程观测台，展示实际依赖、构建和本次浏览器加载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="observatory project-analysis">
    <header class="obs-header">
      <div
        ><span class="obs-kicker">ENGINEERING OBSERVATORY</span
        ><h1>读懂项目的每一层。</h1
        ><p>从插件生态到加载链路，用真实工程数据观察 Robot Admin。</p></div
      >
      <div class="obs-controls"
        ><span class="obs-chip">v{{ projectInfo.version }}</span
        ><button
          class="obs-button"
          type="button"
          :disabled="loading"
          @click="refreshAll"
          ><span class="i-mdi:refresh" />更新观测</button
        ></div
      >
    </header>
    <div class="obs-status"
      ><span
        ><i />{{
          failed
            ? '工程报告暂不可用，可重试获取'
            : report?.build
              ? '本次构建产物 · 当前浏览器实测'
              : '源码清单 · 当前浏览器实测'
        }}</span
      ><span>{{
        report?.build
          ? '体积为原始产物，gzip 为压缩估算'
          : '开发模式不展示未经构建的体积与编译耗时'
      }}</span></div
    >
    <div class="obs-metrics">
      <article
        v-for="metric in headlineMetrics"
        :key="metric.label"
        class="obs-metric"
        ><div class="obs-metric__label"
          >{{ metric.label }}<span :class="metric.icon" /></div
        ><strong>{{ metric.value }}</strong
        ><small>{{ metric.note }}</small></article
      >
    </div>
    <div class="obs-grid">
      <section class="obs-panel bundle-panel">
        <div class="obs-panel__head"
          ><div
            ><h2>构建产物地图</h2
            ><p>矩形面积表达 JS 产物体积，包含异步模块。</p></div
          ><select
            v-model="compressed"
            class="obs-select"
            aria-label="体积口径"
            ><option :value="false">原始体积</option
            ><option :value="true">gzip 估算</option></select
          ></div
        >
        <ObservatoryChart
          :option="bundleOption"
          :empty="!report?.build"
          label="真实 JS 构建产物体积矩形树图"
        />
        <div class="bundle-budget"
          ><div
            ><span>首屏静态资源预算</span
            ><strong
              >{{ formatBytes(report?.build?.initialBytes) }}
              <small
                >/ {{ formatBytes(report?.build?.budgetBytes) }}</small
              ></strong
            ></div
          ><span class="obs-chip">{{
            report?.build
              ? report.build.initialBytes <= report.build.budgetBytes
                ? '预算内'
                : '超出预算'
              : '尚未构建'
          }}</span
          ><div class="budget-track"
            ><i :style="{ width: `${budgetPercent}%` }" /></div
          ><div class="obs-note">{{
            compressed
              ? 'gzip 只估算传输压缩，实际网络结果以服务器与浏览器为准。'
              : '首屏体积按入口 HTML 的 JS、预加载与 CSS 引用计算。'
          }}</div></div
        >
      </section>
      <section class="obs-panel">
        <div class="obs-panel__head"
          ><div
            ><h2>本次文档加载</h2
            ><p>时间原点为文档导航，各阶段可能重叠。</p></div
          ><span class="obs-chip">Performance API</span></div
        >
        <div class="runtime-metrics"
          ><div
            v-for="metric in runtimeMetrics"
            :key="metric.label"
            ><span>{{ metric.label }}</span
            ><strong>{{ formatDuration(metric.value) }}</strong></div
          ></div
        >
        <ObservatoryChart
          :option="waterfallOption"
          :empty="!browser.stages.length"
          label="文档加载与 Vue 初始化时间区间"
        />
        <div class="obs-note"
          >挂载完成是应用标记，不代表可交互时间；此处不测量 Vite
          开发服务器冷启动。</div
        >
      </section>
    </div>
    <div class="obs-grid">
      <section class="obs-panel">
        <div class="obs-panel__head"
          ><div
            ><h2>功能版图</h2
            ><p>仓库菜单清单的叶子路由分布，覆盖各能力域。</p></div
          ><span class="obs-chip">{{ routeCount }} routes</span></div
        >
        <ObservatoryChart
          :option="routeOption"
          :empty="!report"
          label="仓库功能菜单数量分布"
        />
      </section>
      <section class="obs-panel dependency-panel">
        <div class="obs-panel__head"
          ><div><h2>依赖的组成</h2><p>当前直接依赖数量，包含开发工具。</p></div
          ><span class="obs-chip">{{ dependencyCount }} packages</span></div
        >
        <div class="dependency-chart"
          ><ObservatoryChart
            :option="dependencyOption"
            label="直接依赖按职责分组的环形图"
          /><div class="dependency-center"
            ><strong>{{ ecosystem.length }}</strong
            ><span>独立生态包</span></div
          ></div
        >
      </section>
    </div>
    <section class="obs-panel architecture-panel">
      <div class="obs-panel__head"
        ><div
          ><h2>同一生态，多种部署边界。</h2
          ><p>当前是单体应用构建，其余架构在对应分支独立维护。</p></div
        ><span class="obs-chip">PLUGIN FIRST</span></div
      >
      <div class="architecture-grid"
        ><a
          v-for="architecture in architectures"
          :key="architecture.branch"
          :href="`https://github.com/ChenyCHENYU/Robot_Admin/tree/${architecture.branch}`"
          target="_blank"
          rel="noopener noreferrer"
          ><span
            :class="architecture.icon"
            class="architecture-icon"
          /><small>{{ architecture.name }}</small
          ><h3>{{ architecture.title }}</h3
          ><p>{{ architecture.description }}</p
          ><span
            class="architecture-link"
            aria-hidden="true"
            >↗</span
          ></a
        ></div
      >
      <div class="ecosystem-strip"
        ><a
          v-for="item in ecosystem"
          :key="item.name"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          ><span>{{ item.name.replace('@robot-admin/', '') }}</span
          ><strong>v{{ item.version }}</strong></a
        ></div
      >
    </section>
    <section class="obs-panel resource-panel">
      <div class="obs-panel__head"
        ><div
          ><h2>当前文档的资源耗时</h2
          ><p>已加载 JS / CSS 的较慢样本，包含路由按需加载与预取。</p></div
        ><span class="obs-chip"
          >{{ browser.resources.length }} samples</span
        ></div
      >
      <div class="obs-table-wrap"
        ><table class="obs-table"
          ><thead
            ><tr
              ><th>资源</th><th>相对耗时</th><th class="numeric">加载耗时</th
              ><th class="numeric">解码体积</th></tr
            ></thead
          ><tbody
            ><tr
              v-for="resource in browser.resources"
              :key="resource.name"
              ><td
                ><code>{{ resource.name }}</code></td
              ><td class="resource-bar-cell"
                ><div class="resource-track"
                  ><i
                    :style="{
                      width: `${(resource.duration / maxResourceDuration) * 100}%`,
                    }" /></div></td
              ><td class="numeric">{{ formatDuration(resource.duration) }}</td
              ><td class="numeric">{{
                resource.size ? formatBytes(resource.size) : '缓存或不可读'
              }}</td></tr
            ><tr v-if="!browser.resources.length"
              ><td
                colspan="4"
                class="obs-empty"
                >浏览器尚未提供可读的资源样本</td
              ></tr
            ></tbody
          ></table
        ></div
      >
    </section>
    <footer class="obs-footer"
      ><span>项目清单来自当前源码与安装依赖；浏览器指标仅代表本次文档。</span
      ><span>{{
        report ? new Date(report.generatedAt).toLocaleString() : '等待工程报告'
      }}</span></footer
    >
  </div>
</template>
<script setup lang="ts">
  import ObservatoryChart from '../shared/c_chart/index.vue'
  import { useProjectReport } from '../shared/useProjectReport'
  import { formatBytes, formatDuration } from '../shared/d_format'
  import {
    projectInfo,
    ecosystem,
    architectures,
    dependencyOption,
    createBundleOption,
    createRouteOption,
    readBrowserPerformance,
    createWaterfallOption,
  } from './data'
  defineOptions({ name: 'ProjectAnalysis' })
  const { report, failed, loading, refresh } = useProjectReport()
  const compressed = ref(false)
  const browser = ref(readBrowserPerformance())
  const dependencyCount =
    projectInfo.dependencies.length + projectInfo.devDependencies.length
  const routeCount = computed(
    () =>
      report.value?.inventory.routes.reduce(
        (sum, group) => sum + group.count,
        0
      ) ?? 0
  )
  const headlineMetrics = computed(() => [
    {
      label: 'Vue 视图文件',
      value: report.value?.inventory.vueFiles ?? '—',
      note: '扫描 src/views，包含页面与子视图',
      icon: 'i-mdi:layers-triple-outline',
    },
    {
      label: '已安装业务组件',
      value: report.value?.inventory.components ?? '—',
      note: '从组件包实际公开声明计数',
      icon: 'i-mdi:puzzle-outline',
    },
    {
      label: '独立生态包',
      value: ecosystem.length,
      note: '运行依赖与工程规范包合计',
      icon: 'i-mdi:package-variant-closed',
    },
    {
      label: '本次编译耗时',
      value: formatDuration(report.value?.build?.durationMs),
      note: '构建开始到写入产物报告前',
      icon: 'i-mdi:timer-outline',
    },
  ])
  const runtimeMetrics = computed(() => [
    { label: 'TTFB', value: browser.value.ttfb },
    { label: 'FCP', value: browser.value.fcp },
    { label: 'DOM Ready', value: browser.value.domReady },
    { label: '挂载完成', value: browser.value.mounted },
  ])
  const bundleOption = computed(() =>
    createBundleOption(report.value?.build, compressed.value)
  )
  const routeOption = computed(() => createRouteOption(report.value?.inventory))
  const waterfallOption = computed(() => createWaterfallOption(browser.value))
  const budgetPercent = computed(() =>
    report.value?.build
      ? Math.min(
          100,
          (report.value.build.initialBytes / report.value.build.budgetBytes) *
            100
        )
      : 0
  )
  const maxResourceDuration = computed(() =>
    Math.max(1, ...browser.value.resources.map(item => item.duration))
  )
  /** 显式更新本次文档性能与报告，保持原有页面状态。 */
  const refreshAll = () => {
    browser.value = readBrowserPerformance()
    void refresh()
  }
  let sampleTimer: ReturnType<typeof setTimeout> | undefined
  onMounted(() => {
    sampleTimer = setTimeout(() => {
      browser.value = readBrowserPerformance()
    }, 800)
  })
  onBeforeUnmount(() => {
    if (sampleTimer) clearTimeout(sampleTimer)
  })
  onActivated(() => {
    browser.value = readBrowserPerformance()
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
