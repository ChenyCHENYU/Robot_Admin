/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 规则试算场景，样例数据只用于演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import type { FormulaEditorConfig } from '@robot-admin/naive-ui-components/C_FormulaEditor'

export const formulaScenarios: {
  id: string
  label: string
  description: string
  expression: string
  config: FormulaEditorConfig
}[] = [
  {
    id: 'delivery',
    label: '交付达成率',
    description: '比例计算与安全除法',
    expression:
      'IF([计划任务] > 0, ROUND([完成任务] / [计划任务] * 100, 2), 0)',
    config: {
      variables: [
        {
          name: '完成任务',
          field: 'completed',
          type: 'number',
          group: '交付数据',
          description: '本周期已经完成的任务数',
        },
        {
          name: '计划任务',
          field: 'planned',
          type: 'number',
          group: '交付数据',
          description: '本周期计划交付的任务数',
        },
      ],
      sampleData: { completed: 42, planned: 50 },
      templates: [
        {
          label: '达成率',
          value:
            'IF([计划任务] > 0, ROUND([完成任务] / [计划任务] * 100, 2), 0)',
          description: '计划为零时返回零，避免除零',
        },
        {
          label: '剩余任务',
          value: 'MAX([计划任务] - [完成任务], 0)',
          description: '超额完成时不产生负数',
        },
      ],
    },
  },
  {
    id: 'quality',
    label: '质量门禁',
    description: '条件判断与文本结果',
    expression:
      'IF(AND([通过率] >= [门禁阈值], [阻断问题] == 0), "可交付", "需要复核")',
    config: {
      variables: [
        {
          name: '通过率',
          field: 'passRate',
          type: 'number',
          group: '质量数据',
          description: '检查通过率，单位 %',
        },
        {
          name: '门禁阈值',
          field: 'threshold',
          type: 'number',
          group: '规则参数',
          description: '交付要求的最低通过率',
        },
        {
          name: '阻断问题',
          field: 'blockers',
          type: 'number',
          group: '质量数据',
          description: '尚未解决的阻断项数量',
        },
      ],
      sampleData: { passRate: 98, threshold: 95, blockers: 0 },
    },
  },
  {
    id: 'budget',
    label: '构建预算',
    description: '聚合计算与超额判断',
    expression: 'ROUND(SUM([编译耗时], [检查耗时], [打包耗时]), 1)',
    config: {
      variables: [
        {
          name: '编译耗时',
          field: 'compile',
          type: 'number',
          group: '流水线',
          description: '示例编译耗时，单位秒',
        },
        {
          name: '检查耗时',
          field: 'checks',
          type: 'number',
          group: '流水线',
          description: '示例检查耗时，单位秒',
        },
        {
          name: '打包耗时',
          field: 'bundle',
          type: 'number',
          group: '流水线',
          description: '示例打包耗时，单位秒',
        },
        {
          name: '时间预算',
          field: 'budget',
          type: 'number',
          group: '预算',
          description: '允许的总耗时，单位秒',
        },
      ],
      sampleData: { compile: 12.4, checks: 8.6, bundle: 19, budget: 45 },
      templates: [
        {
          label: '总耗时',
          value: 'ROUND(SUM([编译耗时], [检查耗时], [打包耗时]), 1)',
          description: '聚合三个阶段的耗时',
        },
        {
          label: '预算检查',
          value: 'SUM([编译耗时], [检查耗时], [打包耗时]) <= [时间预算]',
          description: '布尔结果：是否满足时间预算',
        },
      ],
    },
  },
]
