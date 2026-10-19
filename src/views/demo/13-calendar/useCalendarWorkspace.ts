/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 本地日程工作台的筛选、持久化、编辑和日历同步
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  CalendarExpose,
  CalendarProps,
  CalendarEvent,
  CalendarViewType,
} from '@robot-admin/naive-ui-components/C_FullCalendar'
import type {
  FormInstance,
  FormConfig,
} from '@robot-admin/naive-ui-components/C_Form'
import type { DateClickArg } from '@fullcalendar/interaction'
import {
  CALENDAR_STORAGE_KEY,
  CATEGORIES,
  createScheduleEvents,
  createScheduleFields,
  buildScheduleEvent,
  editScheduleDraft,
  mergeScheduleChanges,
  localDay,
  eventDate,
  occursOnDay,
  parseScheduleBackup,
  type ScheduleEvent,
  type ScheduleDraft,
  type ScheduleCategory,
} from './data'

/** 演示数据只保存在本机；所有筛选共享同一份日程，防止拖动时丢失隐藏分类。 */
export function useCalendarWorkspace() {
  const message = useMessage()
  const dialog = useDialog()
  const calendarRef = ref<CalendarExpose | null>(null)
  const formRef = ref<FormInstance<ScheduleDraft> | null>(null)
  const fileRef = ref<HTMLInputElement | null>(null)
  const events = ref<ScheduleEvent[]>(createScheduleEvents())
  const storageAvailable = ref(true)
  try {
    const saved = localStorage.getItem(CALENDAR_STORAGE_KEY)
    if (saved) events.value = parseScheduleBackup(saved)
  } catch {
    storageAvailable.value = false
  }
  const persist = () => {
    try {
      localStorage.setItem(
        CALENDAR_STORAGE_KEY,
        JSON.stringify({ schemaVersion: 1, events: events.value })
      )
      storageAvailable.value = true
    } catch {
      storageAvailable.value = false
    }
  }
  watch(events, persist, { deep: true })
  const editable = ref(true)
  const showWeekends = ref(true)
  const search = ref('')
  const categories = ref<ScheduleCategory[]>(CATEGORIES.map(item => item.value))
  const selectedDay = ref(localDay(new Date()))
  const view = ref<CalendarViewType>('dayGridMonth')
  const calendarTitle = ref('')
  const showEditor = ref(false)
  const draft = ref<ScheduleDraft>({
    id: '',
    title: '',
    category: 'meeting',
    start: null,
    end: null,
    allDay: false,
    location: '',
    description: '',
  })
  const filteredEvents = computed(() =>
    events.value.filter(
      item =>
        categories.value.includes(item.category) &&
        `${item.title} ${item.location} ${item.description}`
          .toLowerCase()
          .includes(search.value.trim().toLowerCase())
    )
  )
  const agenda = computed(() =>
    filteredEvents.value
      .filter(item => occursOnDay(item, selectedDay.value))
      .sort(
        (a, b) => eventDate(a.start).getTime() - eventDate(b.start).getTime()
      )
  )
  const selectedDayLabel = computed(() =>
    eventDate(selectedDay.value).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  )
  const stats = computed(() => {
    const today = localDay(new Date())
    const week = new Date()
    week.setHours(0, 0, 0, 0)
    week.setDate(week.getDate() - ((week.getDay() + 6) % 7))
    const end = new Date(week)
    end.setDate(end.getDate() + 7)
    return {
      today: events.value.filter(event => occursOnDay(event, today)).length,
      week: events.value.filter(
        event =>
          eventDate(event.start) < end &&
          eventDate(event.end ?? event.start) > week
      ).length,
      total: events.value.length,
    }
  })
  const fields = computed(() => createScheduleFields(draft.value.allDay))
  const categoryMeta = (category: ScheduleCategory) =>
    CATEGORIES.find(item => item.value === category)!
  const eventTime = (event: ScheduleEvent) =>
    event.allDay
      ? '全天'
      : `${eventDate(event.start).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })} – ${eventDate(event.end ?? event.start).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  const draftDateLabel = (value: number | null) => {
    if (value === null) return '—'
    const date = new Date(value)
    return draft.value.allDay
      ? date.toLocaleDateString('zh-CN')
      : date.toLocaleString('zh-CN', { hour12: false })
  }
  const toggleCategory = (category: ScheduleCategory) => {
    categories.value = categories.value.includes(category)
      ? categories.value.filter(item => item !== category)
      : [...categories.value, category]
  }
  const openEditor = (event?: ScheduleEvent, start?: Date, end?: Date) => {
    if (!event && !editable.value) return
    const initial = start ?? eventDate(selectedDay.value)
    const begin = new Date(initial)
    if (!start) begin.setHours(9, 0, 0, 0)
    const finish = end ?? new Date(begin.getTime() + 3600000)
    draft.value = event
      ? editScheduleDraft(event)
      : {
          id: '',
          title: '',
          category: 'meeting',
          start: begin.getTime(),
          end: finish.getTime(),
          allDay: false,
          location: '',
          description: '',
        }
    showEditor.value = true
  }
  const saveSchedule = (value: ScheduleDraft) => {
    if (!editable.value) throw new Error('当前为只读模式')
    const item = buildScheduleEvent(value)
    events.value = value.id
      ? events.value.map(event => (event.id === value.id ? item : event))
      : [...events.value, item]
    selectedDay.value = localDay(eventDate(item.start))
    calendarRef.value?.getApi()?.gotoDate(eventDate(item.start))
    showEditor.value = false
  }
  const formConfig: FormConfig<ScheduleDraft> = {
    density: 'compact',
    labelPlacement: 'top',
    showActions: false,
    submitSuccessText: '日程已保存',
    onSubmit: ({ model }) => saveSchedule(model),
  }
  const conflicts = computed(() => {
    const { start, end } = draft.value
    if (start === null || end === null || draft.value.allDay) return []
    return events.value.filter(
      event =>
        event.id !== draft.value.id &&
        !event.allDay &&
        eventDate(event.start).getTime() < end &&
        eventDate(event.end ?? event.start).getTime() > start
    )
  })
  const deleteSchedule = () => {
    if (!editable.value || !draft.value.id) return
    dialog.warning({
      title: '删除日程',
      content: `确认删除「${draft.value.title}」？`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: () => {
        events.value = events.value.filter(event => event.id !== draft.value.id)
        showEditor.value = false
        message.success('日程已删除')
      },
    })
  }
  const duplicateSchedule = () => {
    if (!editable.value) return
    draft.value = {
      ...draft.value,
      id: '',
      title: `${draft.value.title}（副本）`.slice(0, 120),
    }
  }
  const updateVisibleEvents = (value: CalendarEvent[]) => {
    events.value = mergeScheduleChanges(events.value, value)
  }
  const calendarConfig = computed<NonNullable<CalendarProps['config']>>(() => {
    const day = selectedDay.value
    return {
      headerToolbar: false,
      height: 'auto',
      firstDay: 1,
      weekends: showWeekends.value,
      fixedWeekCount: false,
      dayMaxEvents: 3,
      selectable: editable.value,
      selectMirror: true,
      eventDisplay: 'block',
      displayEventEnd: false,
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      dayCellClassNames: info =>
        localDay(info.date) === day ? ['calendar-selected-day'] : [],
      datesSet: info => {
        calendarTitle.value = info.view.title
      },
      dateClick: (info: DateClickArg) => {
        selectedDay.value = localDay(info.date)
      },
      select: info => {
        if (editable.value) {
          const end = new Date(info.end)
          end.setDate(end.getDate() - 1)
          selectedDay.value = localDay(info.start)
          if (localDay(info.start) === localDay(end)) {
            calendarRef.value?.getApi()?.unselect()
            return
          }
          openEditor(undefined, info.start, end)
          draft.value.allDay = true
        }
        calendarRef.value?.getApi()?.unselect()
      },
      eventClick: info => {
        info.jsEvent.preventDefault()
        const event = events.value.find(item => item.id === info.event.id)
        if (event) openEditor(event)
      },
    }
  })
  const navigate = (direction: 'prev' | 'next' | 'today') => {
    const api = calendarRef.value?.getApi()
    if (api) {
      api[direction]()
      if (direction === 'today') selectedDay.value = localDay(new Date())
    }
  }
  const exportBackup = () => {
    const blob = new Blob(
      [JSON.stringify({ schemaVersion: 1, events: events.value }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `robot-calendar-${localDay(new Date())}.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importBackup = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file || !editable.value) return
    if (file.size > 2 * 1024 * 1024) {
      message.error('备份文件不能超过 2 MB')
      return
    }
    try {
      const restored = parseScheduleBackup(await file.text())
      dialog.warning({
        title: '导入日程备份',
        content: `将用 ${restored.length} 条日程替换本机现有记录，建议先导出现有备份。`,
        positiveText: '确认导入',
        negativeText: '取消',
        onPositiveClick: () => {
          events.value = restored
          message.success('日程已导入')
        },
      })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '读取备份失败')
    }
  }
  const restoreSamples = () => {
    if (!editable.value) return
    dialog.warning({
      title: '恢复示例日程',
      content: '将替换当前本机日程，可先导出备份保存自己的安排。',
      positiveText: '恢复示例',
      negativeText: '取消',
      onPositiveClick: () => {
        events.value = createScheduleEvents()
        search.value = ''
        categories.value = CATEGORIES.map(item => item.value)
        navigate('today')
      },
    })
  }
  onMounted(() => {
    const api = calendarRef.value?.getApi()
    if (api) calendarTitle.value = api.view.title
  })
  return {
    calendarRef,
    formRef,
    fileRef,
    events,
    editable,
    showWeekends,
    search,
    categories,
    selectedDay,
    selectedDayLabel,
    view,
    calendarTitle,
    showEditor,
    draft,
    filteredEvents,
    agenda,
    stats,
    fields,
    formConfig,
    conflicts,
    calendarConfig,
    storageAvailable,
    categoryMeta,
    eventTime,
    draftDateLabel,
    toggleCategory,
    openEditor,
    deleteSchedule,
    duplicateSchedule,
    updateVisibleEvents,
    navigate,
    exportBackup,
    importBackup,
    restoreSamples,
  }
}
