<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\50-timeline\index.vue
 * @Description: 发布日志时间线与验证流程示例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="release-journal">
    <header class="journal-heading"
      ><span>RELEASE JOURNAL / C_TIMELINE</span><h1>每一次迭代，都有迹可循</h1
      ><p>从项目发布记录阅读变化，也从验证流程理解交付。</p></header
    >
    <div class="journal-layout">
      <aside class="journal-index"
        ><div class="journal-version"
          ><span>CURRENT APPLICATION</span
          ><strong>v{{ applicationVersion }}</strong
          ><p>当前安装项目的应用版本</p></div
        ><nav aria-label="时间线场景"
          ><button
            type="button"
            :class="{ active: scene === 'release' }"
            :aria-pressed="scene === 'release'"
            @click="scene = 'release'"
            ><span class="i-mdi:source-branch" /><span
              >发布记录<small>{{ RELEASES.length }} 个已记录版本</small></span
            ></button
          ><button
            type="button"
            :class="{ active: scene === 'verify' }"
            :aria-pressed="scene === 'verify'"
            @click="scene = 'verify'"
            ><span class="i-mdi:check-decagram-outline" /><span
              >验证流程<small>项目 verify 脚本顺序</small></span
            ></button
          ></nav
        ><div class="journal-source"
          ><span>记录来源</span
          ><strong>{{
            scene === 'release' ? 'CHANGELOG.md' : 'package.json'
          }}</strong
          ><p>{{
            scene === 'release'
              ? '直接读取仓库发布记录。当前分支尚未发布的改动，不冒充已发布版本。'
              : '展示检查流程与实际命令，不表示这些步骤正在执行。'
          }}</p></div
        ><a
          href="https://github.com/ChenyCHENYU/Robot_Admin/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          >查看仓库日志 <span class="i-mdi:arrow-top-right" /></a
      ></aside>
      <section class="journal-content"
        ><header
          ><div
            ><span class="eyebrow">{{
              scene === 'release' ? 'VERSION HISTORY' : 'DELIVERY WORKFLOW'
            }}</span
            ><h2>{{
              scene === 'release' ? '版本轨迹' : '从检查到交付'
            }}</h2></div
          ><div class="journal-controls"
            ><label v-if="scene === 'release'"
              ><span>最新优先</span
              ><NSwitch
                v-model:value="latestFirst"
                size="small" /></label
            ><NButton
              size="small"
              @click="toggleDetails"
              >{{ expanded ? '收起详情' : '展开详情' }}</NButton
            ></div
          ></header
        ><C_Timeline
          :key="`${scene}-${visibleCount}`"
          ref="timeline"
          :items="items"
          :reverse="scene === 'release' && !latestFirst"
          :line-type="scene === 'verify' ? 'dashed' : 'solid'"
          label-placement="left"
          size="large"
        /><NButton
          v-if="scene === 'release' && visibleCount < RELEASE_TIMELINE.length"
          block
          class="journal-more"
          @click="visibleCount += 8"
          >加载更早的版本</NButton
        ><div
          v-if="scene === 'verify'"
          class="journal-workflow-note"
          ><span
            class="i-mdi:information-outline"
          />蓝色节点表示流程定义。实际构建结果可以在工程分析页或终端验证报告中查看。</div
        ></section
      >
    </div>
  </div>
</template>
<script setup lang="ts">
  import {
    RELEASES,
    RELEASE_TIMELINE,
    VERIFY_TIMELINE,
    applicationVersion,
  } from './data'
  defineOptions({ name: 'Demo50Timeline' })
  const scene = ref<'release' | 'verify'>('release')
  const latestFirst = ref(true)
  const visibleCount = ref(8)
  const expanded = ref(false)
  const timeline = ref<{ expandAll: () => void; collapseAll: () => void }>()
  const items = computed(() =>
    scene.value === 'release'
      ? RELEASE_TIMELINE.slice(0, visibleCount.value)
      : VERIFY_TIMELINE
  )
  /** 将展开控制交给组件公开的方法。 */
  const toggleDetails = () => {
    expanded.value = !expanded.value
    if (expanded.value) timeline.value?.expandAll()
    else timeline.value?.collapseAll()
  }
  watch([scene, visibleCount], async () => {
    expanded.value = false
    await nextTick()
    timeline.value?.collapseAll()
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
