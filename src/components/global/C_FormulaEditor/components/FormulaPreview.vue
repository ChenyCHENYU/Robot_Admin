<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FormulaEditor\components\FormulaPreview.vue
 * @Description: 公式计算结果预览
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="formula-preview">
    <div class="formula-preview__header">
      <C_Icon
        name="mdi:calculator-variant-outline"
        style="font-size: 15px"
      />
      <span>计算预览</span>
    </div>

    <!-- 当没有公式时 -->
    <div
      v-if="!formula.trim()"
      class="formula-preview__empty"
    >
      输入公式后可预览计算结果
    </div>

    <!-- 没有样例数据时 -->
    <div
      v-else-if="!hasSampleData"
      class="formula-preview__empty"
    >
      传入 sampleData 后可预览计算结果
    </div>

    <!-- 有结果 -->
    <template v-else>
      <!-- 使用到的变量值 -->
      <div
        v-if="usedVariables.length > 0"
        class="formula-preview__vars"
      >
        <div class="formula-preview__vars-title">变量值</div>
        <div
          v-for="item in usedVariables"
          :key="item.name"
          class="formula-preview__var-row"
        >
          <span class="formula-preview__var-name">{{ item.name }}</span>
          <span class="formula-preview__var-eq">=</span>
          <span class="formula-preview__var-value">{{ item.value }}</span>
        </div>
      </div>

      <NDivider style="margin: 8px 0" />

      <!-- 计算结果 -->
      <div class="formula-preview__result">
        <span class="formula-preview__result-label">结果</span>
        <span
          v-if="evalResult.success && evalResult.result !== undefined"
          class="formula-preview__result-value"
        >
          {{ formatResult(evalResult.result) }}
        </span>
        <span
          v-else-if="evalResult.error"
          class="formula-preview__result-error"
        >
          <C_Icon
            name="mdi:alert-circle-outline"
            style="font-size: 14px"
          />
          {{ evalResult.error }}
        </span>
        <span
          v-else
          class="formula-preview__result-empty"
        >
          —
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  interface EvalResult {
    success: boolean
    result: unknown
    error?: string
  }

  interface UsedVariable {
    name: string
    value: unknown
  }

  interface Props {
    formula: string
    evalResult: EvalResult
    usedVariables: UsedVariable[]
    hasSampleData: boolean
  }

  defineProps<Props>()

  /** 格式化计算结果 */
  function formatResult(value: unknown): string {
    if (typeof value === 'number') {
      // 数字保留合理精度
      if (Number.isInteger(value)) return String(value)
      return Number(value.toFixed(6)).toString()
    }
    if (typeof value === 'boolean') {
      return value ? '真 (true)' : '假 (false)'
    }
    return String(value)
  }
</script>

<style lang="scss" scoped>
  .formula-preview {
    padding: 12px 16px 14px;
    border-top: 1px solid var(--border-color);
    background: color-mix(in srgb, var(--text-color-3) 2%, var(--card-color));

    &__header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 8px;
      color: var(--text-color-2);
    }

    &__empty {
      font-size: 12px;
      color: var(--text-color-3);
      padding: 8px 0;
    }

    &__vars-title {
      font-size: 11px;
      color: var(--text-color-3);
      margin-bottom: 4px;
    }

    &__var-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 0;
      font-size: 12px;
    }

    &__var-name {
      color: var(--primary-color);
      font-weight: 500;
    }

    &__var-eq {
      color: var(--text-color-3);
    }

    &__var-value {
      font-family: 'Courier New', Courier, monospace;
      color: var(--text-color-1);
      font-weight: 500;
    }

    &__result {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__result-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-color-2);
    }

    &__result-value {
      font-size: 18px;
      font-weight: 700;
      font-family: 'Courier New', Courier, monospace;
      color: var(--primary-color);
    }

    &__result-error {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--error-color);
    }

    &__result-empty {
      font-size: 14px;
      color: var(--text-color-3);
    }
  }
</style>
