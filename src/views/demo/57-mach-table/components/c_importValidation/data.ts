/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\components\c_importValidation\data.ts
 * @Description: 本地导入样例、规范值解析与共享列校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueColumns,
  type RowEditValidationParams,
} from '@agile-team/mach-table-vue'
import type { ImportIssue } from '@agile-team/mach-table-vue/import'

export interface ImportDemoRow {
  id: string
  name: string
  quantity: number
  amount: number
  deliveryDate: Date
  enabled: boolean
}
export type ImportMode = 'replace' | 'append'
export const IMPORT_FIELDS = [
  'id',
  'name',
  'quantity',
  'amount',
  'deliveryDate',
  'enabled',
] as const
export const IMPORT_LABELS = [
  '编号',
  '订单名称',
  '数量',
  '金额',
  '交付日期',
  '启用',
]
export const IMPORT_SAMPLES = {
  valid: [
    ['000001', '精密控制器', 12, 1280.5, '2026-10-27', true],
    ['900719925474099312345', '传感模块', '8', '2460.80', '2026-11-03', false],
  ],
  invalid: [
    ['000003', '错误格式', '不是数字', -1, '2026-02-30', '未知'],
    ['000004', '整行规则', 2, 0, '2026-11-01', true],
  ],
  duplicate: [
    ['000005', '重复订单甲', 1, 20, '2026-10-27', true],
    ['000005', '重复订单乙', 2, 40, '2026-10-28', false],
  ],
}

/** 每条记录占一行，方便对应字段顺序编辑，避免样例逐单元格展开撑高输入区。 */
export function formatImportMatrix(rows: readonly unknown[][]): string {
  return `[\n${rows.map(row => `  ${JSON.stringify(row)}`).join(',\n')}\n]`
}

/** 保留编号原始字符串，拒绝可能已经损失精度的 JSON 数字编号。 */
function parseId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('编号须为非空字符串；长编号与前导零请使用双引号')
  return value.trim()
}

/** 数字和十进制文本统一转为有限数，拒绝空值及隐式布尔转换。 */
function parseNumber(value: unknown): number {
  if (
    typeof value !== 'number' &&
    (typeof value !== 'string' ||
      !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))
  )
    throw new Error('请输入有限数字或十进制数字字符串')
  const number = Number(value)
  if (!Number.isFinite(number)) throw new Error('数值超出有限数字范围')
  return number
}

/** 日期按 UTC 日历校验，避免 2 月 30 日等非法输入被自动滚动到下月。 */
function parseDate(value: unknown): Date {
  if (value instanceof Date && Number.isFinite(value.getTime()))
    return new Date(value)
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error('日期格式须为 YYYY-MM-DD')
  const date = new Date(`${value}T00:00:00.000Z`)
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new Error('日期不是有效日历日期')
  return date
}

/** 只接受明确布尔值，不将任意非空文本当作启用。 */
function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === '是') return true
  if (value === 'false' || value === '否') return false
  throw new Error('启用须为 true / false，或字符串“是 / 否”')
}

/** 每次重置创建独立初始数据；后续模型由表格 API 唯一持有。 */
export function createInitialImportRows(): ImportDemoRow[] {
  return [
    {
      id: 'BASE-0001',
      name: '原有订单',
      quantity: 3,
      amount: 180,
      deliveryDate: new Date('2026-10-26T00:00:00.000Z'),
      enabled: true,
    },
  ]
}

/** 列解析与列校验同时供导入计划和表格输入使用。 */
export const IMPORT_COLUMNS = defineVueColumns<ImportDemoRow>([
  {
    field: 'id',
    headerName: '编号',
    width: 225,
    valueParser: ({ value }) => parseId(value),
  },
  {
    field: 'name',
    headerName: '订单名称',
    width: 150,
    valueParser: ({ value }) => String(value ?? '').trim(),
    validate: value => !!value || '订单名称不能为空',
  },
  {
    field: 'quantity',
    headerName: '数量',
    width: 90,
    align: 'right',
    valueParser: ({ value }) => parseNumber(value),
    validate: value =>
      (Number.isInteger(value) && value > 0) || '数量必须为正整数',
  },
  {
    field: 'amount',
    headerName: '金额',
    width: 135,
    align: 'right',
    valueParser: ({ value }) => parseNumber(value),
    validate: value => value >= 0 || '金额不能为负数',
    valueFormatter: ({ value }) => `¥ ${Number(value).toFixed(2)}`,
    valueSerializer: ({ value, target }) =>
      target === 'xlsx' ? value : Number(value).toFixed(2),
  },
  {
    field: 'deliveryDate',
    headerName: '交付日期',
    width: 135,
    valueParser: ({ value }) => parseDate(value),
    valueFormatter: ({ value }) => value.toISOString().slice(0, 10),
    valueSerializer: ({ value, target }) =>
      target === 'xlsx' ? value : value.toISOString().slice(0, 10),
  },
  {
    field: 'enabled',
    headerName: '启用',
    width: 80,
    valueParser: ({ value }) => parseBoolean(value),
    valueFormatter: ({ value }) => (value ? '启用' : '停用'),
  },
])

/** 整行规则检查解析后的规范值，避免另建一套导入业务校验。 */
export function validateImportRow({
  values,
}: RowEditValidationParams<ImportDemoRow>): true | Record<string, string> {
  return values.enabled === true && Number(values.amount) === 0
    ? { amount: '启用的订单金额必须大于 0' }
    : true
}

/** JSON 只做结构与规模约束；字段转换交给包调用列解析器。 */
export function readImportMatrix(text: string): unknown[][] {
  if (text.length > 20_000) throw new Error('JSON 输入最多 20000 个字符')
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('请输入合法 JSON 二维数组，字符串须使用双引号')
  }
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > 20 ||
    value.some(
      row => !Array.isArray(row) || row.length !== IMPORT_FIELDS.length
    )
  )
    throw new Error('请输入 1–20 行矩阵，每行按说明填写 6 个值')
  return value
}

/** 类型从原始规范值判断，JSON 中的 ISO 文本不冒充 Date 实例。 */
export function importValueType(value: unknown): string {
  return value instanceof Date
    ? 'Date'
    : value === null
      ? 'null'
      : value === undefined
        ? '未解析'
        : typeof value
}

/** 预览保留可读日期与布尔文本，不改变其实际类型。 */
export function displayImportValue(value: unknown): string {
  return value instanceof Date
    ? value.toISOString().slice(0, 10)
    : value == null
      ? '—'
      : String(value)
}

/** 统一中文错误位置，并翻译包的重复编号映射错误。 */
export function describeImportIssue(issue: ImportIssue): string {
  const row = issue.rowIndex < 0 ? '整批数据' : `第 ${issue.rowIndex + 1} 行`
  const index = IMPORT_FIELDS.findIndex(field => field === issue.colId)
  const field = index >= 0 ? ` · ${IMPORT_LABELS[index]}` : ''
  const message =
    issue.code === 'MAPPING' &&
    issue.message.startsWith('Missing or duplicate row key')
      ? '编号为空、批内重复，或与现有记录重复'
      : issue.message
  return `${row}${field}：${message}`
}
