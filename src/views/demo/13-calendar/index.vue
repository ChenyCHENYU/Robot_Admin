<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 08:29:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 11:19:50
 * @FilePath: \Robot_Admin\src\views\demo\13-calendar\index.vue
 * @Description: 日历组件演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="p-20px">
    <c_vTitle
      title="日历组件场景示例"
      icon="mdi:calendar"
      description="支持多种视图、事件拖拽、可编辑模式等特性，适用于日程管理、日程安排等场景"
    />

    <NSpace
      class="mb-20px"
      align="center"
    >
      <NSwitch v-model:value="editable">
        <template #checked><span class="text-12px">可编辑</span></template>
        <template #unchecked><span class="text-12px">只读</span></template>
      </NSwitch>

      <NButton
        type="warning"
        @click="clearAllEvents"
        :disabled="!events.length"
        size="tiny"
        round
      >
        清空所有事件
        <Icon
          icon="mdi:delete-sweep-outline"
          :size="16"
        />
      </NButton>
    </NSpace>

    <!-- 使用优化后的日历组件 -->
    <C_FullCalendar
      v-model:events="events"
      initial-view="dayGridMonth"
      :editable="editable"
      :show-add-dialog="true"
      :show-edit-dialog="true"
      class="calendar-container"
    />

    <!-- 事件统计信息 -->
    <NCard
      class="mt-20px"
      title="事件统计"
      size="small"
    >
      <NSpace>
        <NTag type="info">总事件数: {{ events.length }}</NTag>
        <NTag type="success">今日事件: {{ todayEventsCount }}</NTag>
        <NTag type="warning">本周事件: {{ thisWeekEventsCount }}</NTag>
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo13Calendar' })
  import { INITIAL_EVENTS } from './data'

  const message = useMessage()
  const dialog = useDialog()
  const editable = ref(true)

  // 事件数据 - 使用 v-model 双向绑定
  const events = ref([...INITIAL_EVENTS])

  // 清空所有事件
  const clearAllEvents = () => {
    dialog.warning({
      title: '确认清空',
      content: '确定要清空所有事件吗？此操作不可恢复。',
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: () => {
        events.value = []
        message.success('已清空所有事件')
      },
    })
  }

  // 计算统计信息
  const todayEventsCount = computed(() => {
    const today = new Date()
    const todayStr = today.toDateString()
    return events.value.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === todayStr
    }).length
  })

  const thisWeekEventsCount = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    )
    const nextWeek = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 7
    )

    return events.value.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= startOfWeek && eventDate < nextWeek
    }).length
  })
</script>
