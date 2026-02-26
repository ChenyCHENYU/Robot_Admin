/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\composables\FormulaEditor\useFormulaEvaluator.ts
 * @Description: 公式求值引擎（基于 expr-eval）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type { FormulaVariable } from '@/types/modules/formula-editor'
import { Parser } from 'expr-eval'

/**
 * 公式求值引擎
 * 将公式中的 [变量名] 替换为实际值后计算结果
 */
export function useFormulaEvaluator(variables: Ref<FormulaVariable[]>) {
  /** expr-eval 解析器实例 */
  const parser = new Parser({
    operators: {
      logical: true,
      comparison: true,
      conditional: true,
      add: true,
      subtract: true,
      multiply: true,
      divide: true,
      remainder: true,
    },
  })

  // 注册自定义函数
  parser.functions.IF = (cond: unknown, t: unknown, f: unknown) =>
    cond ? t : f
  parser.functions.AND = (...args: unknown[]) => args.every(Boolean)
  parser.functions.OR = (...args: unknown[]) => args.some(Boolean)
  parser.functions.NOT = (v: unknown) => !v
  parser.functions.SUM = (...args: number[]) => args.reduce((a, b) => a + b, 0)
  parser.functions.AVG = (...args: number[]) =>
    args.length > 0 ? args.reduce((a, b) => a + b, 0) / args.length : 0
  parser.functions.MAX = (...args: number[]) => Math.max(...args)
  parser.functions.MIN = (...args: number[]) => Math.min(...args)
  parser.functions.ABS = Math.abs
  parser.functions.ROUND = (v: number, d = 0) => {
    const f = 10 ** d
    return Math.round(v * f) / f
  }
  parser.functions.CEIL = Math.ceil
  parser.functions.FLOOR = Math.floor

  /** 构建 变量名 → field 映射 */
  const variableMap = computed(() => {
    const map = new Map<string, string>()
    for (const v of variables.value) {
      map.set(v.name, v.field)
    }
    return map
  })

  /**
   * 将公式中的 [变量名] 替换为 field 标识符
   * 例：[完成值] → completion_value
   */
  function replaceVariables(formula: string): string {
    return formula.replace(/\[([^\]]+)\]/g, (_, name: string) => {
      const field = variableMap.value.get(name)
      return field ?? `__unknown__`
    })
  }

  /**
   * 求值：用样例数据计算公式结果
   */
  function evaluate(
    formula: string,
    sampleData: Record<string, number | string | boolean>
  ): { success: boolean; result: unknown; error?: string } {
    if (!formula.trim()) {
      return { success: true, result: undefined }
    }

    try {
      const evalExpr = replaceVariables(formula)
      const parsed = parser.parse(evalExpr)
      const result = parsed.evaluate(sampleData as Record<string, number>)
      return { success: true, result }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      return { success: false, result: undefined, error: message }
    }
  }

  /**
   * 从公式中提取使用到的变量名列表
   */
  function extractVariableNames(formula: string): string[] {
    const names: string[] = []
    const regex = /\[([^\]]+)\]/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(formula)) !== null) {
      if (!names.includes(match[1])) {
        names.push(match[1])
      }
    }
    return names
  }

  return {
    evaluate,
    extractVariableNames,
    variableMap,
  }
}
