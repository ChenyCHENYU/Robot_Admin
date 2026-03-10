import type { FormulaVariable } from '@robot-admin/naive-ui-components'

// ─── 公共变量 / 样例数据（基础用法、精简模式、编程控制共用） ───

/** 销售业务变量 */
export const salesVariables: FormulaVariable[] = [
  { name: '销售额', field: 'sales', type: 'number', group: '业绩数据' },
  { name: '目标额', field: 'target', type: 'number', group: '业绩数据' },
  { name: '退货额', field: 'returns', type: 'number', group: '业绩数据' },
  { name: '成本', field: 'cost', type: 'number', group: '财务数据' },
  { name: '税率', field: 'tax_rate', type: 'number', group: '财务数据' },
  {
    name: '提成比例',
    field: 'commission_rate',
    type: 'number',
    group: '规则参数',
  },
  { name: '基础工资', field: 'base_salary', type: 'number', group: '规则参数' },
]

/** 销售业务样例数据 */
export const salesSampleData: Record<string, number> = {
  sales: 150000,
  target: 100000,
  returns: 5000,
  cost: 80000,
  tax_rate: 0.13,
  commission_rate: 8,
  base_salary: 6000,
}

// ─── 绩效核算场景 ────────────────────────────────

/** 绩效变量 */
export const perfVariables: FormulaVariable[] = [
  { name: '完成值', field: 'actual', type: 'number', group: '业绩数据' },
  {
    name: '卓越档目标值',
    field: 'target_excellent',
    type: 'number',
    group: '目标值',
  },
  {
    name: '优秀档目标值',
    field: 'target_good',
    type: 'number',
    group: '目标值',
  },
  {
    name: '达标档目标值',
    field: 'target_standard',
    type: 'number',
    group: '目标值',
  },
  { name: '卓越系数', field: 'coeff_excellent', type: 'number', group: '系数' },
  { name: '优秀系数', field: 'coeff_good', type: 'number', group: '系数' },
  { name: '基础系数', field: 'coeff_base', type: 'number', group: '系数' },
]

/** 绩效样例数据 */
export const perfSampleData: Record<string, number> = {
  actual: 120000,
  target_excellent: 100000,
  target_good: 80000,
  target_standard: 60000,
  coeff_excellent: 1.5,
  coeff_good: 1.2,
  coeff_base: 0.8,
}

// ─── 成绩 / 函数演示场景 ────────────────────────

/** 成绩变量 */
export const gradeVariables: FormulaVariable[] = [
  { name: '语文', field: 'chinese', type: 'number', group: '成绩' },
  { name: '数学', field: 'math', type: 'number', group: '成绩' },
  { name: '英语', field: 'english', type: 'number', group: '成绩' },
  { name: '总分', field: 'total', type: 'number', group: '汇总' },
  { name: '平均分', field: 'avg_score', type: 'number', group: '汇总' },
]

/** 成绩样例数据 */
export const gradeSampleData: Record<string, number> = {
  chinese: 92,
  math: 88,
  english: 95,
  total: 275,
  avg_score: 91.67,
}

// ─── 默认公式 ───────────────────────────────────

/** 基础用法默认公式 */
export const DEFAULT_BASIC_FORMULA = '[销售额] / [目标额] * 100'

/** 绩效核算默认公式 */
export const DEFAULT_PERF_FORMULA =
  '[完成值] >= [卓越档目标值] ? ([完成值] - [卓越档目标值]) * [卓越系数] + 150000 : [完成值] >= [优秀档目标值] ? ([完成值] - [优秀档目标值]) * [优秀系数] + 87500 : [完成值] * [基础系数]'

/** 精简模式默认公式 */
export const DEFAULT_COMPACT_FORMULA = '[销售额] * [提成比例] / 100'

/** 函数演示默认公式 */
export const DEFAULT_FUNC_FORMULA =
  'IF([总分] >= 270, "优秀", IF([总分] >= 180, "良好", "待提升"))'
