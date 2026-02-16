<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 08:26:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-06 23:43:44
 * @FilePath: \Robot_Admin\src\components\global\C_FullCalendar\index.vue
 * @Description: 全局日历组件 — 薄 UI 壳，逻辑由 useCalendarEvents 驱动
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-full-calendar">
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
    />

    <!-- 事件操作对话框 -->
    <NModal
      v-if="showActionDialog"
      v-model:show="showActionDialog"
      preset="dialog"
      :title="`事件操作 - ${selectedEvent?.title}`"
      style="width: 400px"
    >
      <div class="ml-10% mt-20px">
        <NButton
          type="primary"
          @click="openEditModal"
          style="margin-right: 12px"
          size="small"
        >
          编辑
        </NButton>
        <NButton
          type="error"
          @click="deleteEvent"
          size="small"
        >
          删除
        </NButton>
      </div>
    </NModal>

    <!-- 编辑/添加事件模态框 -->
    <NModal
      v-model:show="showEditModal"
      preset="dialog"
      :title="isEditing ? '编辑事件' : '添加事件'"
      positive-text="保存"
      negative-text="取消"
      @positive-click="saveEvent"
    >
      <div style="padding: 20px">
        <div style="margin-bottom: 16px">
          <label style="display: block; margin-bottom: 8px; font-weight: 500"
            >事件标题</label
          >
          <NInput
            v-model:value="editForm.title"
            placeholder="请输入事件标题"
          />
        </div>

        <div style="margin-bottom: 16px">
          <label style="display: block; margin-bottom: 8px; font-weight: 500"
            >事件日期</label
          >
          <NDatePicker
            v-model:value="editForm.date"
            type="date"
            format="yyyy-MM-dd"
            style="width: 100%"
          />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500"
              >开始时间</label
            >
            <NInput
              v-model:value="editForm.startTime"
              type="time"
              placeholder="09:00"
            />
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-weight: 500"
              >结束时间</label
            >
            <NInput
              v-model:value="editForm.endTime"
              type="time"
              placeholder="10:00"
            />
          </div>
        </div>

        <div style="margin-top: 16px">
          <label style="display: block; margin-bottom: 8px; font-weight: 500"
            >事件颜色</label
          >
          <div style="display: flex; gap: 8px">
            <div
              v-for="color in eventColors"
              :key="color"
              :style="{
                width: '30px',
                height: '30px',
                backgroundColor: color,
                borderRadius: '50%',
                cursor: 'pointer',
                border:
                  editForm.color === color
                    ? '3px solid #000'
                    : '2px solid #ddd',
              }"
              @click="editForm.color = color"
            />
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import FullCalendar from '@fullcalendar/vue3'
  import { useCalendarEvents } from '@/composables/FullCalendar/useCalendarEvents'
  import type {
    CalendarProps,
    CalendarEmits,
    CalendarExpose,
  } from '@/types/modules/calendar'

  // 重新导出类型，保持向后兼容
  export type { CalendarViewType } from '@/types/modules/calendar'

  const props = withDefaults(defineProps<CalendarProps>(), {
    events: () => [],
    initialView: 'dayGridMonth',
    editable: true,
    showAddDialog: true,
    showEditDialog: true,
  })

  const emit = defineEmits<CalendarEmits>()

  const {
    calendarRef,
    calendarOptions,
    showActionDialog,
    showEditModal,
    isEditing,
    selectedEvent,
    editForm,
    eventColors,
    openEditModal,
    saveEvent,
    deleteEvent,
    expose,
  } = useCalendarEvents(props, emit)

  defineExpose<CalendarExpose>(expose)
</script>

<style scoped>
  .calendar-container[data-v-5660a431] {
    background: none;
  }
</style>
