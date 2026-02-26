/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\composables\FormulaEditor\useFormulaParser.ts
 * @Description: 公式解析、分词、校验引擎
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type {
  FormulaFunction,
  FormulaToken,
  FormulaValidation,
  FormulaVariable,
} from '@/types/modules/formula-editor'
import { OPERATORS } from '@/components/global/C_FormulaEditor/constants'

// ─── 分词正则 ───────────────────────────────────

/**
 * 匹配规则（有优先级）：
 *  1. [变量名]  → variable
 *  2. >= <= == != → operator（多字符运算符优先）
 *  3. AND OR NOT → operator（逻辑关键词）
 *  4. 数字(含小数) → number
 *  5. 函数名(     → function（字母序列接左括号）
 *  6. + - * / % > < ? : → operator
 *  7. ( ) ,       → paren/comma
 *  8. 空白         → space
 *  9. 其他         → text
 */
const TOKEN_REGEX =
  /(\[([^\]]+)\])|(>=|<=|==|!=)|\b(AND|OR|NOT)\b|(\d+(?:\.\d+)?)|([A-Za-z_]\w*)(?=\s*\()|([+\-*/%><?:])|([(),])|(\s+)/g

/**
 * 公式解析 & 校验引擎
 */
export function useFormulaParser(
  variables: Ref<FormulaVariable[]>,
  functions: Ref<FormulaFunction[]>
) {
  // ─── 构建查找集 ──────────────────────────────

  /** 有效变量名集合 */
  const variableNames = computed(
    () => new Set(variables.value.map(v => v.name))
  )

  /** 有效函数名集合（大写） */
  const functionNames = computed(
    () => new Set(functions.value.map(f => f.name.toUpperCase()))
  )

  // ─── 分词 ────────────────────────────────────

  /** 根据正则匹配组分类 Token */
  function classifyMatch(
    match: RegExpExecArray,
    start: number,
    end: number
  ): FormulaToken {
    if (match[1]) return { type: 'variable', value: match[2], start, end }
    if (match[3]) return { type: 'operator', value: match[3], start, end }
    if (match[4]) return { type: 'operator', value: match[4], start, end }
    if (match[5]) return { type: 'number', value: match[5], start, end }
    if (match[6]) return { type: 'function', value: match[6], start, end }
    if (match[7]) return { type: 'operator', value: match[7], start, end }
    if (match[8]) {
      const v = match[8]
      return { type: v === ',' ? 'comma' : 'paren', value: v, start, end }
    }
    return { type: 'space', value: match[9] ?? ' ', start, end }
  }

  /** 将公式字符串解析为 Token 数组 */
  function tokenize(formula: string): FormulaToken[] {
    const tokens: FormulaToken[] = []
    const regex = new RegExp(TOKEN_REGEX.source, 'g')
    let match: RegExpExecArray | null
    let lastIndex = 0

    while ((match = regex.exec(formula)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'text',
          value: formula.slice(lastIndex, match.index),
          start: lastIndex,
          end: match.index,
        })
      }

      tokens.push(
        classifyMatch(match, match.index, match.index + match[0].length)
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < formula.length) {
      tokens.push({
        type: 'text',
        value: formula.slice(lastIndex),
        start: lastIndex,
        end: formula.length,
      })
    }

    return tokens
  }

  // ─── 校验 ────────────────────────────────────

  /** 校验括号平衡 */
  function checkParentheses(formula: string): FormulaValidation {
    let depth = 0
    for (let i = 0; i < formula.length; i++) {
      if (formula[i] === '(') depth++
      else if (formula[i] === ')') depth--
      if (depth < 0) {
        return {
          valid: false,
          message: `第 ${i + 1} 个字符处有多余的右括号 )`,
          position: i,
        }
      }
    }
    if (depth > 0) {
      return {
        valid: false,
        message: `缺少 ${depth} 个右括号 )`,
      }
    }
    return { valid: true, message: '' }
  }

  /** 校验变量是否都已定义 */
  function checkVariables(tokens: FormulaToken[]): FormulaValidation {
    for (const token of tokens) {
      if (token.type === 'variable' && !variableNames.value.has(token.value)) {
        return {
          valid: false,
          message: `未知变量「${token.value}」`,
          position: token.start,
        }
      }
    }
    return { valid: true, message: '' }
  }

  /** 校验函数是否已注册 */
  function checkFunctions(tokens: FormulaToken[]): FormulaValidation {
    for (const token of tokens) {
      if (
        token.type === 'function' &&
        !functionNames.value.has(token.value.toUpperCase())
      ) {
        return {
          valid: false,
          message: `未知函数「${token.value}」`,
          position: token.start,
        }
      }
    }
    return { valid: true, message: '' }
  }

  /** 完整校验公式 */
  function validate(formula: string): FormulaValidation {
    if (!formula.trim()) {
      return { valid: true, message: '公式为空' }
    }

    // 1. 括号平衡
    const parenCheck = checkParentheses(formula)
    if (!parenCheck.valid) return parenCheck

    // 2. 分词
    const tokens = tokenize(formula)

    // 3. 变量校验
    const varCheck = checkVariables(tokens)
    if (!varCheck.valid) return varCheck

    // 4. 函数校验
    const funcCheck = checkFunctions(tokens)
    if (!funcCheck.valid) return funcCheck

    // 5. 基本语法校验 — 不能以运算符开头（除了负号）
    const meaningful = tokens.filter(t => t.type !== 'space')
    if (meaningful.length > 0) {
      const first = meaningful[0]
      if (
        first.type === 'operator' &&
        first.value !== '-' &&
        !OPERATORS.has(first.value) === false
      ) {
        return {
          valid: false,
          message: `公式不能以运算符「${first.value}」开头`,
          position: first.start,
        }
      }
    }

    return { valid: true, message: '公式合法' }
  }

  // ─── 公式 → 可求值表达式 ─────────────────────

  /**
   * 将公式字符串转换为 expr-eval 可识别的表达式
   * [变量名] → 变量.field 标识符
   */
  function toEvalExpression(
    formula: string,
    variableMap: Map<string, string>
  ): string {
    return formula.replace(/\[([^\]]+)\]/g, (_, name: string) => {
      const field = variableMap.get(name)
      return field ?? `__unknown_${name}__`
    })
  }

  return {
    tokenize,
    validate,
    toEvalExpression,
    variableNames,
    functionNames,
  }
}
