<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 08:26:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-06 23:43:44
 * @FilePath: \Robot_Admin\src\components\global\C_FullCalendar\index.vue
 * @Description: 全局日历组件 - 内置事件管理功能
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<!--
 * https://fullcalendar.io/
 ? @fullcalendar/core        - 提供日历核心功能
 ? @fullcalendar/vue         - Vue组件集成
 ? @fullcalendar/daygrid     - 月/周/日网格视图
 ? @fullcalendar/interaction - 交互功能(点击/拖拽)
 ! bun add @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/vue3
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
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import listPlugin from '@fullcalendar/list'
  import zhCn from '@fullcalendar/core/locales/zh-cn'

  type CalendarEvent = {
    id: string
    title: string
    start: Date | string
    end?: Date | string
    color?: string
    editable?: boolean
    [key: string]: any
  }

  export type CalendarViewType =
    | 'dayGridMonth'
    | 'dayGridWeek'
    | 'dayGridDay'
    | 'listWeek'

  const props = defineProps({
    events: {
      type: Array as PropType<CalendarEvent[]>,
      default: () => [],
    },
    initialView: {
      type: String as PropType<CalendarViewType>,
      default: 'dayGridMonth',
      validator: (val: string) =>
        ['dayGridMonth', 'dayGridWeek', 'dayGridDay', 'listWeek'].includes(val),
    },
    editable: {
      type: Boolean,
      default: true,
    },
    showAddDialog: {
      type: Boolean,
      default: true,
    },
    showEditDialog: {
      type: Boolean,
      default: true,
    },
  })

  const emit = defineEmits([
    'update:events',
    'event-added',
    'event-updated',
    'event-deleted',
    'event-dropped',
  ])

  const calendarRef = ref()

  const message = useMessage()

  // 内部事件数据
  const internalEvents = ref([...props.events])

  // 模态框状态
  const showActionDialog = ref(false)
  const showEditModal = ref(false)
  const isEditing = ref(false)
  const selectedEvent = ref<any>(null)

  // 编辑表单
  const editForm = ref({
    id: '',
    title: '',
    date: Date.now(),
    startTime: '09:00',
    endTime: '10:00',
    color: '#3f86ff',
  })

  // 事件颜色选项
  const eventColors = [
    '#3f86ff',
    '#ff6b6b',
    '#67c23a',
    '#e6a23c',
    '#9c27b0',
    '#00bcd4',
    '#ff5722',
  ]

  // 日历配置
  const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin, listPlugin],
    locale: zhCn,
    initialView: props.initialView,
    events: internalEvents,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek',
    },
    buttonText: {
      today: '今天',
      month: '月',
      week: '周',
      day: '日',
      list: '列表',
    },
    editable: props.editable,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
  })

  /**
   * * @description: 处理事件点击事件
   * ? @param {*} info {any} FullCalendar事件点击信息对象
   * ! @return {*} {void}
   */
  function handleEventClick(info: any) {
    if (!props.editable) return

    info.jsEvent.preventDefault()
    selectedEvent.value = info.event

    if (props.showEditDialog) {
      showActionDialog.value = true
    }
  }

  /**
   * * @description: 处理日期点击事件（用于添加新事件）
   * ? @param {*} info {any} FullCalendar日期点击信息对象
   * ! @return {*} {void}
   */
  function handleDateClick(info: any) {
    if (!props.editable || !props.showAddDialog) return

    const clickedDate = new Date(info.dateStr)
    openAddModal(clickedDate)
  }

  /**
   * * @description: 处理事件拖拽移动
   * ? @param {*} info {any} FullCalendar事件拖拽信息对象
   * ! @return {*} {void}
   */
  function handleEventDrop(info: any) {
    updateEventInArray({
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
    })

    emit('event-dropped', {
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
    })

    message.success(`事件 "${info.event.title}" 时间已更新`)
  }

  /**
   * * @description: 处理事件大小调整（持续时间调整）
   * ? @param {*} info {any} FullCalendar事件调整信息对象
   * ! @return {*} {void}
   */
  function handleEventResize(info: any) {
    updateEventInArray({
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
    })

    emit('event-updated', {
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
    })
  }

  /**
   * * @description: 打开添加事件模态框
   * ? @param {*} date {Date} 要添加事件的日期
   * ! @return {*} {void}
   */
  function openAddModal(date: Date) {
    isEditing.value = false
    editForm.value = {
      id: '',
      title: '',
      date: date.getTime(),
      startTime: '09:00',
      endTime: '10:00',
      color: eventColors[Math.floor(Math.random() * eventColors.length)],
    }
    showEditModal.value = true
  }

  /**
   * * @description: 打开编辑事件模态框
   * ? @param {*} {void}
   * ! @return {*} {void}
   */
  function openEditModal() {
    if (!selectedEvent.value) return

    isEditing.value = true
    const event = selectedEvent.value
    const startDate = new Date(event.start)
    const endDate = event.end
      ? new Date(event.end)
      : new Date(event.start.getTime() + 3600000)

    editForm.value = {
      id: event.id,
      title: event.title,
      date: startDate.getTime(),
      startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
      color: event.backgroundColor || '#3f86ff',
    }

    showActionDialog.value = false
    showEditModal.value = true
  }

  /**
   * * @description: 保存事件（添加或更新）
   * ? @param {*} {void}
   * ! @return {*} {boolean}
   */
  function saveEvent() {
    if (!editForm.value.title.trim()) {
      message.error('请输入事件标题')
      return false
    }

    if (editForm.value.startTime >= editForm.value.endTime) {
      message.error('结束时间必须晚于开始时间')
      return false
    }

    const eventDate = new Date(editForm.value.date)
    const dateStr = eventDate.toISOString().split('T')[0]

    const eventData = {
      id: isEditing.value ? editForm.value.id : Date.now().toString(),
      title: editForm.value.title,
      start: new Date(`${dateStr}T${editForm.value.startTime}:00`),
      end: new Date(`${dateStr}T${editForm.value.endTime}:00`),
      color: editForm.value.color,
    }

    if (isEditing.value) {
      updateEventInArray(eventData)
      emit('event-updated', eventData)
      message.success('事件已更新')
    } else {
      addEventToArray(eventData)
      emit('event-added', eventData)
      message.success('事件已添加')
    }

    showEditModal.value = false
    return true
  }

  /**
   * * @description: 删除选中的事件
   * ? @param {*} {void}
   * ! @return {*} {void}
   */
  function deleteEvent() {
    if (!selectedEvent.value) return

    const eventId = selectedEvent.value.id
    const eventTitle = selectedEvent.value.title

    removeEventFromArray(eventId)
    emit('event-deleted', { id: eventId, title: eventTitle })

    showActionDialog.value = false
    message.success(`已删除事件: ${eventTitle}`)
  }

  /**
   * * @description: 添加事件到内部事件数组
   * ? @param {*} event {CalendarEvent} 事件对象
   * ! @return {*} {void}
   */
  function addEventToArray(event: CalendarEvent) {
    internalEvents.value = [...internalEvents.value, event]
    emit('update:events', internalEvents.value)
  }

  /**
   * * @description: 通过事件ID更新内部事件数组中的事件
   * ? @param {*} eventData {Partial<CalendarEvent>} 部分事件数据
   * ! @return {*} {void}
   */
  function updateEventInArray(eventData: Partial<CalendarEvent>) {
    const index = internalEvents.value.findIndex(e => e.id === eventData.id)
    if (index !== -1) {
      internalEvents.value = internalEvents.value.map((event, i) =>
        i === index ? { ...event, ...eventData } : event
      )
      emit('update:events', internalEvents.value)
    }
  }

  /**
   * * @description: 从内部事件数组中删除指定事件
   * ? @param {*} eventId {string} 事件ID
   * ! @return {*} {void}
   */
  function removeEventFromArray(eventId: string) {
    internalEvents.value = internalEvents.value.filter(e => e.id !== eventId)
    emit('update:events', internalEvents.value)
  }

  // 监听外部事件变化
  watch(
    () => props.events,
    newEvents => {
      internalEvents.value = [...newEvents]
    },
    { deep: true }
  )

  // 监听内部事件变化，更新日历
  watch(
    internalEvents,
    newEvents => {
      calendarOptions.value.events = newEvents
    },
    { deep: true }
  )

  // 暴露方法
  defineExpose({
    getApi: () => {
      // 需要获取 FullCalendar 组件的引用
      const calendarApi = calendarRef.value?.getApi()
      return calendarApi
    },
    addEvent: addEventToArray,
    updateEvent: updateEventInArray,
    deleteEvent: removeEventFromArray,
    getEvents: () => internalEvents.value,
  })
</script>

<style scoped>
  .calendar-container[data-v-5660a431] {
    background: none;
  }
</style>
