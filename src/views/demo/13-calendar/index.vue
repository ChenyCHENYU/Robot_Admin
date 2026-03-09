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
        <span class="i-mdi:clear"></span>
      </NButton>
    </NSpace>

    <!-- 使用优化后的日历组件 -->
    <C_FullCalendar
      ref="calendarRef"
      v-model:events="events"
      :initial-view="currentView"
      :editable="editable"
      :show-add-dialog="true"
      :show-edit-dialog="true"
      @event-added="handleEventAdded"
      @event-updated="handleEventUpdated"
      @event-deleted="handleEventDeleted"
      @event-dropped="handleEventDropped"
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
  import type { CalendarViewType } from '@robot-admin/naive-ui-components'
  import { INITIAL_EVENTS } from './data'

  const message = useMessage()
  const dialog = useDialog()
  const calendarRef = ref()

  // 视图控制
  const currentView = ref<CalendarViewType>('dayGridMonth')
  const editable = ref(true)

  // 事件数据 - 使用 v-model 双向绑定
  const events = ref([...INITIAL_EVENTS])

  // 事件回调处理
  const handleEventAdded = (event: any) => {
    console.log('事件已添加:', event)
    // 可以在这里处理额外的业务逻辑，如保存到服务器
  }

  const handleEventUpdated = (event: any) => {
    console.log('事件已更新:', event)
    // 可以在这里处理额外的业务逻辑
  }

  const handleEventDeleted = (event: any) => {
    console.log('事件已删除:', event)
    // 可以在这里处理额外的业务逻辑
  }

  const handleEventDropped = (event: any) => {
    console.log('事件已拖拽:', event)
    // 拖拽完成的回调
  }

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
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))

    return events.value.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= startOfWeek && eventDate <= endOfWeek
    }).length
  })

  // 监听事件数量变化，展示提示
  watch(
    () => events.value.length,
    (newCount, oldCount) => {
      if (newCount > oldCount) {
        console.log(`事件数量增加到 ${newCount}`)
      } else if (newCount < oldCount) {
        console.log(`事件数量减少到 ${newCount}`)
      }
    }
  )
</script>
