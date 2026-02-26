<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FormulaEditor\components\FormulaInput.vue
 * @Description: 公式输入区（contenteditable + Token 渲染）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="formula-input"
    :class="{
      'formula-input--disabled': disabled,
      'formula-input--error': !validation.valid && formula.trim(),
    }"
  >
    <!-- 标题行 -->
    <div class="formula-input__header">
      <span class="formula-input__label">公式编辑</span>
      <a
        v-if="formula.trim() && !disabled"
        class="formula-input__clear"
        @click="handleClear"
      >
        清空
      </a>
    </div>

    <!-- 编辑器 -->
    <div
      ref="editorRef"
      class="formula-input__editor"
      contenteditable="true"
      :data-placeholder="placeholder"
      spellcheck="false"
      @input="handleInput"
      @keydown="handleKeyDown"
      @paste="handlePaste"
      @focus="isFocused = true"
      @blur="handleBlur"
    />

    <!-- 问题（校验信息）三态：空 / 合法 / 错误 -->
    <div class="formula-input__validation">
      <span class="formula-input__validation-label">问题</span>

      <!-- 空公式：提示占位 -->
      <span
        v-if="!formula.trim()"
        class="formula-input__validation-hint"
      >
        <C_Icon
          name="mdi:information-outline"
          style="font-size: 13px"
        />
        请输入公式，公式合法后可计算预览
      </span>

      <!-- 合法：绿色通过 -->
      <span
        v-else-if="validation.valid"
        class="formula-input__validation-success"
      >
        <C_Icon
          name="mdi:check-circle-outline"
          style="font-size: 13px"
        />
        公式合法，语法正确
      </span>

      <!-- 错误：红色提示 -->
      <span
        v-else
        class="formula-input__validation-error"
      >
        <C_Icon
          name="mdi:alert-circle-outline"
          style="font-size: 13px"
        />
        {{ validation.message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormulaToken,
    FormulaValidation,
  } from '@/types/modules/formula-editor'

  interface Props {
    formula: string
    tokens: FormulaToken[]
    validation: FormulaValidation
    variableNames: Set<string>
    disabled?: boolean
    placeholder?: string
  }

  interface Emits {
    (e: 'update:formula', value: string): void
    (e: 'focus'): void
    (e: 'blur'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    placeholder: '点击变量或使用键盘输入公式，变量用 [变量名] 包裹',
  })

  const emit = defineEmits<Emits>()

  const editorRef = ref<HTMLDivElement>()
  const isFocused = ref(false)

  /** 是否正在由外部更新内容（防止循环触发） */
  let isExternalUpdate = false

  /** 保存 blur 前的光标 Range，供外部调用 insertAtCursor 时恢复 */
  let savedRange: Range | null = null

  // ─── 渲染公式为 HTML ─────────────────────────

  /** 将公式字符串渲染为 HTML（变量显示为 chip） */
  function renderFormula(formula: string): string {
    if (!formula) return ''

    // 使用分词结果构建 HTML
    const { tokens } = props
    if (tokens.length === 0 && formula.trim()) {
      return escapeHtml(formula)
    }

    let html = ''
    for (const token of tokens) {
      switch (token.type) {
        case 'variable':
          html += `<span class="formula-chip" contenteditable="false" data-variable="${escapeAttr(token.value)}">${escapeHtml(token.value)}</span>`
          break
        case 'function':
          html += `<span class="formula-func">${escapeHtml(token.value)}</span>`
          break
        case 'operator':
          html += `<span class="formula-op">${escapeHtml(token.value)}</span>`
          break
        case 'number':
          html += `<span class="formula-num">${escapeHtml(token.value)}</span>`
          break
        case 'paren':
          html += `<span class="formula-paren">${escapeHtml(token.value)}</span>`
          break
        default:
          html += escapeHtml(token.value)
      }
    }
    return html
  }

  /** HTML 转义 */
  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /** 属性值转义 */
  function escapeAttr(str: string): string {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  // ─── 从 DOM 提取公式 ─────────────────────────

  /** 从 contenteditable DOM 提取纯公式字符串 */
  function extractFormula(): string {
    const el = editorRef.value
    if (!el) return ''

    let result = ''
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent ?? ''
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        if (element.classList.contains('formula-chip')) {
          const varName =
            element.getAttribute('data-variable') ?? element.textContent
          result += `[${varName}]`
        } else {
          result += element.textContent ?? ''
        }
      }
    }
    return result
  }

  // ─── 光标管理 ─────────────────────────────────

  /** 保存当前光标位置 */
  function saveCursorPosition(): number {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editorRef.value) return -1

    const range = sel.getRangeAt(0)
    const preRange = document.createRange()
    preRange.selectNodeContents(editorRef.value)
    preRange.setEnd(range.startContainer, range.startOffset)
    return preRange.toString().length
  }

  /** 在文本节点中查找目标位置 */
  function findInTextNode(
    node: Node,
    currentPos: number,
    charPos: number
  ): { found: boolean; node: Node; offset: number; pos: number } {
    const len = node.textContent?.length ?? 0
    if (currentPos + len >= charPos) {
      return {
        found: true,
        node,
        offset: charPos - currentPos,
        pos: currentPos,
      }
    }
    return { found: false, node, offset: 0, pos: currentPos + len }
  }

  /** 在 chip 节点中查找目标位置 */
  function findInChipNode(
    node: Node,
    currentPos: number,
    charPos: number,
    walker: TreeWalker
  ): { found: boolean; node: Node | null; offset: number; pos: number } {
    const chipLen =
      (node as HTMLElement).getAttribute('data-variable')?.length ?? 0
    const fullLen = chipLen + 2
    if (currentPos + fullLen >= charPos) {
      const parent = node.parentNode
      const idx =
        Array.from(parent?.childNodes ?? []).indexOf(node as ChildNode) + 1
      return { found: true, node: parent, offset: idx, pos: currentPos }
    }
    walker.nextNode()
    return { found: false, node: null, offset: 0, pos: currentPos + fullLen }
  }

  /** 恢复光标到指定字符位置 */
  function restoreCursorPosition(charPos: number) {
    const el = editorRef.value
    if (!el || charPos < 0) return

    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    )
    let currentPos = 0
    let targetNode: Node | null = null
    let targetOffset = 0

    while (walker.nextNode()) {
      const node = walker.currentNode
      if (node.nodeType === Node.TEXT_NODE) {
        const result = findInTextNode(node, currentPos, charPos)
        if (result.found) {
          targetNode = result.node
          targetOffset = result.offset
          break
        }
        currentPos = result.pos
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node as HTMLElement).classList?.contains('formula-chip')
      ) {
        const result = findInChipNode(node, currentPos, charPos, walker)
        if (result.found) {
          targetNode = result.node
          targetOffset = result.offset
          break
        }
        currentPos = result.pos
      }
    }

    setCursorAt(el, targetNode, targetOffset)
  }

  /** 设置光标到目标节点或末尾 */
  function setCursorAt(
    container: HTMLElement,
    node: Node | null,
    offset: number
  ) {
    const range = document.createRange()
    if (!node) {
      range.selectNodeContents(container)
      range.collapse(false)
    } else {
      try {
        range.setStart(node, offset)
        range.collapse(true)
      } catch {
        range.selectNodeContents(container)
        range.collapse(false)
      }
    }
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  /** 将光标移到末尾 */
  function moveCursorToEnd() {
    const el = editorRef.value
    if (!el) return
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  // ─── 事件处理 ─────────────────────────────────

  /** 输入事件 */
  function handleInput() {
    if (isExternalUpdate) return
    const formula = extractFormula()
    emit('update:formula', formula)
  }

  /** 键盘事件 */
  function handleKeyDown(e: KeyboardEvent) {
    if (props.disabled) {
      e.preventDefault()
      return
    }
    // Tab 键切换焦点而非插入
    if (e.key === 'Tab') {
      e.preventDefault()
    }
  }

  /** 粘贴事件 — 只保留纯文本 */
  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') ?? ''
    document.execCommand('insertText', false, text)
  }

  /** blur 时保存光标位置 Range */
  function handleBlur() {
    isFocused.value = false
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedRange = sel.getRangeAt(0).cloneRange()
    }
  }

  /** 清空 */
  function handleClear() {
    emit('update:formula', '')
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.innerHTML = ''
      }
    })
  }

  // ─── 暴露方法 ─────────────────────────────────

  /** 在光标位置插入文本 */
  function insertAtCursor(text: string) {
    const el = editorRef.value
    if (!el) return

    el.focus()

    // 恢复 blur 前保存的光标位置
    if (savedRange) {
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(savedRange)
    }

    // 如果是变量文本（[xxx]），插入 chip
    const varMatch = text.match(/^\[(.+)\]$/)
    if (varMatch) {
      const chip = document.createElement('span')
      chip.className = 'formula-chip'
      chip.contentEditable = 'false'
      chip.setAttribute('data-variable', varMatch[1])
      chip.textContent = varMatch[1]

      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        range.insertNode(chip)

        // 在 chip 后插入一个空格
        const space = document.createTextNode(' ')
        range.setStartAfter(chip)
        range.insertNode(space)
        range.setStartAfter(space)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
        savedRange = range.cloneRange()
      }
    } else {
      // 普通文本直接插入
      document.execCommand('insertText', false, text)
      // 更新保存的光标
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0).cloneRange()
      }
    }

    // 触发更新
    const formula = extractFormula()
    emit('update:formula', formula)
  }

  /** 退格（删除光标前一个字符或 chip） */
  function backspace() {
    const el = editorRef.value
    if (!el) return

    el.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    // 检查光标前一个节点是否是 chip
    if (range.startOffset > 0 && range.startContainer === el) {
      const prevNode = el.childNodes[range.startOffset - 1]
      if (
        prevNode &&
        prevNode.nodeType === Node.ELEMENT_NODE &&
        (prevNode as HTMLElement).classList?.contains('formula-chip')
      ) {
        prevNode.remove()
        emit('update:formula', extractFormula())
        return
      }
    }

    // 普通退格
    document.execCommand('delete', false)
    emit('update:formula', extractFormula())
  }

  /** 聚焦 */
  function focus() {
    editorRef.value?.focus()
    moveCursorToEnd()
  }

  // ─── 监听外部公式变化更新显示 ─────────────────

  watch(
    () => props.formula,
    newFormula => {
      const el = editorRef.value
      if (!el) return

      // 检查当前 DOM 内容是否已经一致（避免循环）
      const current = extractFormula()
      if (current === newFormula) return

      isExternalUpdate = true
      const pos = saveCursorPosition()
      el.innerHTML = renderFormula(newFormula)
      nextTick(() => {
        restoreCursorPosition(pos)
        isExternalUpdate = false
      })
    }
  )

  // 初始化渲染
  onMounted(() => {
    if (editorRef.value && props.formula) {
      editorRef.value.innerHTML = renderFormula(props.formula)
    }
  })

  defineExpose({
    insertAtCursor,
    backspace,
    focus,
    moveCursorToEnd,
  })
</script>

<style lang="scss" scoped>
  .formula-input {
    background: var(--card-color);
    transition: background 0.2s;
    border-bottom: 1px solid var(--border-color);

    &--error {
      background: color-mix(in srgb, var(--error-color) 3%, var(--card-color));
    }

    &--disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px 0;
    }

    &__label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-color-2);
    }

    &__clear {
      font-size: 12px;
      color: var(--primary-color);
      cursor: pointer;
      user-select: none;

      &:hover {
        opacity: 0.8;
      }
    }

    &__editor {
      min-height: 72px;
      max-height: 180px;
      padding: 8px 16px 12px;
      font-size: 14px;
      line-height: 2;
      color: var(--text-color-1);
      outline: none;
      overflow-y: auto;
      word-break: break-all;
      white-space: pre-wrap;

      &:empty::before {
        content: attr(data-placeholder);
        color: var(--text-color-3);
        pointer-events: none;
      }

      // 变量 chip
      :deep(.formula-chip) {
        display: inline-flex;
        align-items: center;
        padding: 1px 8px;
        margin: 0 2px;
        border-radius: 4px;
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
        color: var(--primary-color);
        font-weight: 500;
        font-size: 13px;
        line-height: 22px;
        vertical-align: baseline;
        user-select: none;
        cursor: default;
      }

      // 函数名
      :deep(.formula-func) {
        color: color-mix(in srgb, var(--primary-color) 80%, #8b5cf6);
        font-weight: 600;
      }

      // 运算符
      :deep(.formula-op) {
        color: var(--warning-color, #f0a020);
        font-weight: 600;
      }

      // 数字
      :deep(.formula-num) {
        color: color-mix(
          in srgb,
          var(--success-color, #18a058) 90%,
          transparent
        );
      }

      // 括号
      :deep(.formula-paren) {
        color: var(--text-color-2);
        font-weight: 600;
      }
    }

    &__error {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 16px 8px;
      font-size: 12px;
      color: var(--error-color);
    }

    // ─── 校验信息区 ──────────────

    &__validation {
      padding: 10px 16px 12px;
      border-top: 1px solid var(--border-color);
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 12px;

      &-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-color-2);
        flex-shrink: 0;
        min-width: 28px;
      }

      &-hint {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--text-color-3);
      }

      &-success {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--success-color, #18a058);
      }

      &-error {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--error-color);
      }
    }
  }
</style>
