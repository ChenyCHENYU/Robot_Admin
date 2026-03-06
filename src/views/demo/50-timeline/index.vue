<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\50-timeline\index.vue
 * @Description: 时间线组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="timeline-demo">
    <NH1>时间线组件场景示例</NH1>

    <!-- ==================== 功能特性 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:puzzle-outline"
          class="title-icon"
        />
        功能特性
      </h2>
      <div class="feature-grid">
        <div
          v-for="feat in FEATURE_LIST"
          :key="feat.title"
          class="feature-card"
        >
          <div class="feature-card__icon">
            <C_Icon :name="feat.icon" />
          </div>
          <div class="feature-card__body">
            <span class="feature-card__title">{{ feat.title }}</span>
            <span class="feature-card__desc">{{ feat.desc }}</span>
          </div>
          <NTag
            :bordered="false"
            size="small"
            :type="TAG_TYPE_MAP[feat.tag] ?? 'default'"
          >
            {{ feat.tag }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- ==================== 场景切换 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:television-play"
          class="title-icon"
        />
        在线演示
      </h2>
      <p class="section-desc">
        选择不同场景，体验时间线组件在各类业务场景中的表现。
      </p>

      <div class="scene-switcher">
        <div
          v-for="scene in DEMO_SCENES"
          :key="scene.key"
          class="scene-card"
          :class="{ 'is-active': activeScene === scene.key }"
          @click="activeScene = scene.key"
        >
          <C_Icon
            :name="scene.icon"
            class="scene-card__icon"
          />
          <span class="scene-card__title">{{ scene.title }}</span>
          <span class="scene-card__desc">{{ scene.description }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== 控制面板 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:tune-variant"
          class="title-icon"
        />
        交互控制
      </h2>
      <div class="control-panel">
        <NSpace
          align="center"
          :wrap="true"
        >
          <NButton
            size="small"
            @click="tlRef?.expandAll()"
          >
            展开全部
          </NButton>
          <NButton
            size="small"
            @click="tlRef?.collapseAll()"
          >
            折叠全部
          </NButton>
          <NDivider vertical />
          <NSwitch
            v-model:value="showPending"
            size="small"
          >
            <template #checked>Pending</template>
            <template #unchecked>Pending</template>
          </NSwitch>
          <NSwitch
            v-model:value="reversed"
            size="small"
          >
            <template #checked>反转</template>
            <template #unchecked>反转</template>
          </NSwitch>
          <NSwitch
            v-model:value="showTime"
            size="small"
          >
            <template #checked>时间</template>
            <template #unchecked>时间</template>
          </NSwitch>
          <NDivider vertical />
          <NRadioGroup
            v-model:value="lineType"
            size="small"
          >
            <NRadioButton value="solid"> 实线 </NRadioButton>
            <NRadioButton value="dashed"> 虚线 </NRadioButton>
            <NRadioButton value="dotted"> 点线 </NRadioButton>
          </NRadioGroup>
          <NDivider vertical />
          <NRadioGroup
            v-model:value="nodeSize"
            size="small"
          >
            <NRadioButton value="small"> S </NRadioButton>
            <NRadioButton value="medium"> M </NRadioButton>
            <NRadioButton value="large"> L </NRadioButton>
          </NRadioGroup>
        </NSpace>
      </div>
    </div>

    <!-- ==================== 时间线实例 ==================== -->
    <div class="demo-section demo-section--timeline">
      <!-- 项目发布 -->
      <C_Timeline
        v-if="activeScene === 'project'"
        ref="tlRef"
        :items="PROJECT_TIMELINE"
        :pending="showPending"
        :reverse="reversed"
        :show-time="showTime"
        :line-type="lineType"
        :size="nodeSize"
        @expand="handleExpand"
      />

      <!-- CI 流水线（水平） -->
      <C_Timeline
        v-else-if="activeScene === 'pipeline'"
        ref="tlRef"
        :items="CI_PIPELINE_TIMELINE"
        mode="horizontal"
        :reverse="reversed"
        :show-time="showTime"
        :line-type="lineType"
        :size="nodeSize"
        :pending="showPending"
      />

      <!-- 物流 -->
      <C_Timeline
        v-else
        ref="tlRef"
        :items="ORDER_TIMELINE"
        :pending="showPending"
        :reverse="reversed"
        :show-time="showTime"
        :line-type="lineType"
        :size="nodeSize"
        @expand="handleExpand"
      />
    </div>

    <!-- ==================== 事件日志 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:console"
          class="title-icon"
        />
        事件日志
        <NButton
          quaternary
          size="small"
          style="margin-left: auto"
          @click="eventLogs = []"
        >
          清空
        </NButton>
      </h2>
      <div class="event-log-panel">
        <div
          v-for="(log, idx) in eventLogs.slice(-15)"
          :key="idx"
          class="event-log-item"
        >
          <span class="event-log-time">{{ log.time }}</span>
          <NTag
            :type="log.type"
            size="small"
            :bordered="false"
          >
            {{ log.event }}
          </NTag>
          <span
            v-if="log.detail"
            class="event-log-detail"
          >
            {{ log.detail }}
          </span>
        </div>
        <div
          v-if="!eventLogs.length"
          class="event-log-empty"
        >
          操作后事件将在此处实时显示...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TimelineItem } from '@robot-admin/naive-ui-components'
  import {
    PROJECT_TIMELINE,
    CI_PIPELINE_TIMELINE,
    ORDER_TIMELINE,
    DEMO_SCENES,
    FEATURE_LIST,
    TAG_TYPE_MAP,
  } from './data'
  import './index.scss'

  // ===== 状态 =====
  const tlRef = ref()
  const activeScene = ref('project')
  const showPending = ref(false)
  const reversed = ref(false)
  const showTime = ref(true)
  const lineType = ref<'solid' | 'dashed' | 'dotted'>('solid')
  const nodeSize = ref<'small' | 'medium' | 'large'>('medium')

  // ===== 事件日志 =====
  interface EventLog {
    time: string
    event: string
    type: 'default' | 'success' | 'info' | 'warning' | 'error'
    detail?: string
  }
  const eventLogs = ref<EventLog[]>([])

  /** 添加事件日志 */
  function addLog(
    event: string,
    type: EventLog['type'] = 'default',
    detail?: string
  ) {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    eventLogs.value.push({ time, event, type, detail })
  }

  const handleExpand = (item: TimelineItem, expanded: boolean) => {
    addLog(
      'expand',
      expanded ? 'success' : 'info',
      `${item.title} → ${expanded ? '展开' : '折叠'}`
    )
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
