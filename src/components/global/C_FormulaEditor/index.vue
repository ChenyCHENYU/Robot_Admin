<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FormulaEditor\index.vue
 * @Description: 公式编辑器 — 主组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    class="c-formula"
    :style="{ height: containerHeight }"
  >
    <!-- ═══════ 顶部标题行 ═══════ -->
    <div class="c-formula__title-row">
      <div class="c-formula__title">
        <C_Icon
          name="mdi:function-variant"
          style="font-size: 18px"
        />
        <span>公式编辑器</span>
      </div>
      <NTag
        :type="validation.valid ? 'success' : 'error'"
        size="small"
        round
      >
        <template #icon>
          <C_Icon
            :name="validation.valid ? 'mdi:check-circle' : 'mdi:alert-circle'"
          />
        </template>
        {{ validation.valid ? '合法' : '错误' }}
      </NTag>
    </div>

    <!-- ═══════ 主内容区域 ═══════ -->
    <div class="c-formula__body">
      <!-- 左侧：变量面板 -->
      <div
        v-if="props.showVariablePanel"
        class="c-formula__sidebar"
      >
        <VariablePanel
          :variables="variableList"
          :functions="functionList"
          @select-variable="handleSelectVariable"
          @select-function="handleSelectFunction"
        />
      </div>

      <!-- 右侧：编辑区 + 键盘 + 预览 -->
      <div class="c-formula__main">
        <!-- 公式输入区 -->
        <FormulaInput
          ref="formulaInputRef"
          :formula="formula"
          :tokens="tokens"
          :validation="validation"
          :variable-names="parser.variableNames.value"
          :disabled="props.disabled"
          :placeholder="props.placeholder"
          @update:formula="handleFormulaUpdate"
        />

        <!-- 虚拟键盘 -->
        <div
          v-if="props.showKeyboard"
          class="c-formula__keyboard"
        >
          <VirtualKeyboard
            :disabled="props.disabled"
            @key-press="handleKeyPress"
            @action="handleAction"
          />
        </div>

        <!-- 计算预览 -->
        <FormulaPreview
          v-if="props.showPreview && hasSampleData"
          :formula="formula"
          :eval-result="evalResult"
          :used-variables="usedVariableValues"
          :has-sample-data="hasSampleData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormulaEditorEmits,
    FormulaEditorExpose,
    FormulaEditorProps,
    FormulaFunction,
    FormulaKeyboardKey,
    FormulaVariable,
  } from '@/types/modules/formula-editor'
  import { DEFAULT_FUNCTIONS } from './constants'
  import { useFormulaParser } from '@/composables/FormulaEditor/useFormulaParser'
  import { useFormulaEvaluator } from '@/composables/FormulaEditor/useFormulaEvaluator'
  import FormulaInput from './components/FormulaInput.vue'
  import VariablePanel from './components/VariablePanel.vue'
  import VirtualKeyboard from './components/VirtualKeyboard.vue'
  import FormulaPreview from './components/FormulaPreview.vue'

  // ─── Props & Emits ─────────────────────────────

  const props = withDefaults(defineProps<FormulaEditorProps>(), {
    modelValue: '',
    variables: () => [],
    functions: undefined,
    sampleData: undefined,
    disabled: false,
    placeholder: '点击变量或使用键盘输入公式，变量用 [变量名] 包裹',
    height: 'auto',
    showPreview: true,
    showKeyboard: true,
    showVariablePanel: true,
  })

  const emit = defineEmits<FormulaEditorEmits>()

  // ─── 组件引用 ──────────────────────────────────

  const formulaInputRef = ref<InstanceType<typeof FormulaInput>>()

  // ─── 变量与函数列表 ────────────────────────────

  const variableList = computed(() => props.variables ?? [])
  const functionList = computed(() => props.functions ?? DEFAULT_FUNCTIONS)

  // ─── 初始化组合函数 ────────────────────────────

  const parser = useFormulaParser(variableList, functionList)
  const evaluator = useFormulaEvaluator(variableList)

  // ─── 本地状态 ──────────────────────────────────

  /** 公式字符串 */
  const formula = ref(props.modelValue || '')

  /** Token 列表 */
  const tokens = computed(() => parser.tokenize(formula.value))

  /** 校验结果 */
  const validation = computed(() => parser.validate(formula.value))

  // ─── 容器高度 ──────────────────────────────────

  const containerHeight = computed(() => {
    if (typeof props.height === 'number') return `${props.height}px`
    return props.height
  })

  // ─── 求值相关 ──────────────────────────────────

  /** 是否有样例数据 */
  const hasSampleData = computed(
    () => !!props.sampleData && Object.keys(props.sampleData).length > 0
  )

  /** 求值结果 */
  const evalResult = computed(() => {
    if (
      !formula.value.trim() ||
      !hasSampleData.value ||
      !validation.value.valid
    ) {
      return { success: true, result: undefined }
    }
    return evaluator.evaluate(formula.value, props.sampleData!)
  })

  /** 提取公式中使用到的变量 + 对应样例数据值 */
  const usedVariableValues = computed(() => {
    if (!hasSampleData.value) return []
    const names = evaluator.extractVariableNames(formula.value)
    return names.map(name => {
      const variable = variableList.value.find(v => v.name === name)
      const field = variable?.field ?? name
      const value = props.sampleData?.[field]
      return { name, value: value ?? '未提供' }
    })
  })

  // ─── 初始化 ────────────────────────────────────

  onMounted(() => {
    if (props.modelValue) {
      formula.value = props.modelValue
    }
  })

  // ─── 监听外部 v-model ─────────────────────────

  watch(
    () => props.modelValue,
    newVal => {
      if (newVal !== undefined && newVal !== formula.value) {
        formula.value = newVal
      }
    }
  )

  // ─── 监听内部公式变更 → 同步外部 ──────────────

  watch(formula, newFormula => {
    emit('update:modelValue', newFormula)
    emit('change', newFormula)
  })

  // ─── 监听校验状态 ─────────────────────────────

  watch(validation, v => {
    emit('validation-change', v)
  })

  // ─── 公式更新处理 ─────────────────────────────

  /** FormulaInput 输入更新 */
  function handleFormulaUpdate(value: string) {
    formula.value = value
  }

  // ─── 变量面板交互 ─────────────────────────────

  /** 选择变量 → 插入到光标 */
  function handleSelectVariable(variable: FormulaVariable) {
    formulaInputRef.value?.insertAtCursor(`[${variable.name}]`)
  }

  /** 选择函数 → 插入到光标 */
  function handleSelectFunction(func: FormulaFunction) {
    formulaInputRef.value?.insertAtCursor(`${func.name}(`)
  }

  // ─── 虚拟键盘交互 ─────────────────────────────

  /** 按键 → 插入值到光标 */
  function handleKeyPress(key: FormulaKeyboardKey) {
    formulaInputRef.value?.insertAtCursor(key.value)
  }

  /** 动作键处理 */
  function handleAction(action: string) {
    if (action === 'BACKSPACE') {
      formulaInputRef.value?.backspace()
    } else if (action === 'CLEAR') {
      formula.value = ''
    }
  }

  // ─── 暴露方法 ─────────────────────────────────

  defineExpose<FormulaEditorExpose>({
    getValue: () => formula.value,
    setValue: (expr: string) => {
      formula.value = expr
    },
    reset: () => {
      formula.value = props.modelValue || ''
    },
    validate: () => parser.validate(formula.value),
    insertAtCursor: (text: string) => {
      formulaInputRef.value?.insertAtCursor(text)
    },
    focus: () => {
      formulaInputRef.value?.focus()
    },
  })
</script>

<style lang="scss" scoped>
  .c-formula {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--card-color);
    overflow: hidden;

    // ═══════ 标题行 ═══════

    &__title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color);
    }

    &__title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 15px;
      color: var(--text-color-1);
    }

    // ═══════ 主内容 ═══════

    &__body {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    &__sidebar {
      width: 210px;
      flex-shrink: 0;
      border-right: 1px solid var(--border-color);
    }

    &__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    &__keyboard {
      padding: 14px 18px;
      border-top: 1px solid var(--border-color);
    }
  }

  // ═══════ 响应式 ═══════

  @media (max-width: 768px) {
    .c-formula {
      &__body {
        flex-direction: column;
      }

      &__sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }
    }
  }
</style>
