/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\production-matrix\model.ts
 * @Description: 检测矩阵的复合值、校验与统一报表口径
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface SampleReading {
  value: number | null
  time: string
}
export interface MatrixSlot {
  id: string
  date: string
  shift: string
}
export interface MatrixRow {
  id: string
  tank: string
  indicator: string
  unit: string
  precision: number
  lower: number
  upper: number
  samples: Record<string, SampleReading | null>
}
export const EMPTY_READING: SampleReading = Object.freeze({
  value: null,
  time: '',
})
export const SHIFTS = ['早班', '中班', '夜班'] as const

/** 日期仅作业务日期运算，使用 UTC 避免宿主时区改变日期。 */
export function createSlots(days: number): MatrixSlot[] {
  return Array.from({ length: days }, (_, day) => {
    const date = new Date(Date.UTC(2026, 10, 6 + day))
      .toISOString()
      .slice(0, 10)
    return SHIFTS.map((shift, index) => ({
      id: `${date}_${index}`,
      date,
      shift,
    }))
  }).flat()
}

/** 每种指标保留自己的单位与精度，种子中同时覆盖零值、缺测与超限。 */
export function createMatrixRows(slots: readonly MatrixSlot[]): MatrixRow[] {
  const specs = [
    { indicator: '游离酸', unit: 'g/L', precision: 2, lower: 40, upper: 80 },
    { indicator: '铁离子', unit: 'g/L', precision: 2, lower: 0, upper: 120 },
    { indicator: '槽液温度', unit: '℃', precision: 1, lower: 65, upper: 85 },
  ]
  return ['1# 酸洗槽', '2# 酸洗槽', '3# 酸洗槽', '漂洗槽'].flatMap(
    (tank, tankIndex) =>
      specs.map((spec, index) => ({
        id: `tank-${tankIndex}-${index}`,
        tank,
        ...spec,
        samples: Object.fromEntries(
          slots.map((slot, slotIndex) => {
            if ((slotIndex + tankIndex + index) % 13 === 12)
              return [slot.id, null]
            const value =
              tankIndex === 0 && index === 1 && slotIndex === 0
                ? 0
                : Number(
                    (
                      spec.lower +
                      (spec.upper - spec.lower) *
                        (0.25 + ((slotIndex * 3 + tankIndex + index) % 12) / 12)
                    ).toFixed(spec.precision)
                  )
            const hour = [8, 16, 0][slotIndex % 3]
            return [
              slot.id,
              Object.freeze({
                value,
                time: `${String(hour).padStart(2, '0')}:${String(15 + (slotIndex % 4) * 10).padStart(2, '0')}`,
              }),
            ]
          })
        ),
      }))
  )
}

/** 严格解析单个复合检测格，拒绝把不完整文本猜成检测值。 */
function parseReadingText(text: string): SampleReading | null {
  if (!text) return null
  const match = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*@\s*(\d{2}:\d{2})$/.exec(
    text
  )
  if (!match) throw new Error('请粘贴“数值 @ HH:mm”，如 52.50 @ 08:30')
  return { value: Number(match[1]), time: match[2] }
}

/** 编辑器只允许结果/时间对象，剪贴板只允许规范文本，清空沿用 Core 的 null 契约。 */
function decodeReading(raw: unknown): SampleReading | null {
  if (raw === null) return null
  if (typeof raw === 'string') return parseReadingText(raw.trim())
  if (raw && typeof raw === 'object' && 'value' in raw && 'time' in raw) {
    const candidate = raw as SampleReading
    return { value: candidate.value, time: candidate.time }
  }
  throw new Error('检测值格式无效')
}

/** 复合剪贴板格式为“数值 @ HH:mm”；空单元格同时清空两个字段。 */
export function parseReading(
  raw: unknown,
  oldValue?: SampleReading | null
): SampleReading | null {
  const next = decodeReading(raw)
  if (next === null || (next.value === null && next.time === '')) return null
  if (
    oldValue &&
    Object.is(next.value, oldValue.value) &&
    next.time === oldValue.time
  )
    return oldValue
  return Object.freeze(next)
}

/** 空值和零值严格区分；结果和时间必须同时填写或同时留空。 */
export function validateReading(
  reading: SampleReading | null,
  precision: number
): true | string {
  if (reading === null) return true
  if (reading.value === null && reading.time === '') return true
  if (typeof reading.value !== 'number' || !Number.isFinite(reading.value))
    return '请填写有效的检测数值'
  if (reading.value < 0 || reading.value > 999999)
    return '检测值应在 0～999999 之间'
  if (Math.abs(reading.value - Number(reading.value.toFixed(precision))) > 1e-9)
    return `最多保留 ${precision} 位小数`
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(reading.time))
    return '检测结果需要有效取样时间（HH:mm）'
  return true
}

/** 复制时保留指标精度和时间，零值始终输出为数字。 */
export function serializeReading(
  reading: SampleReading | null,
  precision: number
): string {
  return reading === null || reading.value === null
    ? ''
    : `${reading.value.toFixed(precision)} @ ${reading.time}`
}

/** 保存、打印与导出均读取同一份已提交的单元格状态，不读取编辑器草稿。 */
export function createReport(
  rows: readonly MatrixRow[],
  slots: readonly MatrixSlot[]
) {
  return rows.flatMap(row =>
    slots.map(slot => {
      const reading = row.samples[slot.id] ?? EMPTY_READING
      return {
        日期: slot.date,
        班次: slot.shift,
        槽位: row.tank,
        检测项目: row.indicator,
        单位: row.unit,
        内控下限: row.lower,
        内控上限: row.upper,
        检测值: reading.value,
        取样时间: reading.time,
        判定:
          reading.value === null
            ? '未取样'
            : reading.value < row.lower || reading.value > row.upper
              ? '超出内控'
              : '正常',
      }
    })
  )
}
export type MatrixReport = ReturnType<typeof createReport>

/** 导出文本遵循 CSV 引号规则，并阻断电子表格公式注入。 */
export function reportCsv(report: MatrixReport): string {
  if (!report.length) return ''
  const headers = Object.keys(report[0])
  const escape = (value: unknown) => {
    const text = value == null ? '' : String(value)
    const safe =
      typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)
        ? `'${text}`
        : text
    return `"${safe.replace(/"/g, '""')}"`
  }
  return (
    '\uFEFF' +
    [headers, ...report.map(row => Object.values(row))]
      .map(row => row.map(escape).join(','))
      .join('\r\n')
  )
}
