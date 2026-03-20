/**
 * @Description: 日历组件演示页 - 静态数据
 */

// ================= 初始日历事件 =================
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
}

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: '团队会议',
    start: new Date(),
    end: new Date(Date.now() + 2 * 3600000),
    color: '#3f86ff',
  },
  {
    id: '2',
    title: '项目评审',
    start: new Date(Date.now() + 3 * 864e5),
    end: new Date(Date.now() + 3 * 864e5 + 3 * 3600000),
    color: '#ff6b6b',
  },
  {
    id: '3',
    title: '客户拜访',
    start: new Date(Date.now() + 1 * 864e5 + 9 * 3600000),
    end: new Date(Date.now() + 1 * 864e5 + 11 * 3600000),
    color: '#67c23a',
  },
]
