/** 日历事件数据 */
export interface CalendarEvent {
  id: string
  title: string
  start: Date | string
  end?: Date | string
  color?: string
  editable?: boolean
  [key: string]: any
}

/** 日历视图类型 */
export type CalendarViewType =
  | 'dayGridMonth'
  | 'dayGridWeek'
  | 'dayGridDay'
  | 'listWeek'

/** 编辑表单数据 */
export interface CalendarEditForm {
  id: string
  title: string
  date: number
  startTime: string
  endTime: string
  color: string
}

/** 日历组件 Props */
export interface CalendarProps {
  events?: CalendarEvent[]
  initialView?: CalendarViewType
  editable?: boolean
  showAddDialog?: boolean
  showEditDialog?: boolean
}

/** 日历组件 Emits */
export interface CalendarEmits {
  'update:events': [events: CalendarEvent[]]
  'event-added': [event: CalendarEvent]
  'event-updated': [event: Partial<CalendarEvent>]
  'event-deleted': [event: { id: string; title: string }]
  'event-dropped': [event: Partial<CalendarEvent>]
}

/** 日历组件暴露方法 */
export interface CalendarExpose {
  getApi: () => any
  addEvent: (event: CalendarEvent) => void
  updateEvent: (eventData: Partial<CalendarEvent>) => void
  deleteEvent: (eventId: string) => void
  getEvents: () => CalendarEvent[]
}
