<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-26 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-26 23:52:52
 * @FilePath: \Robot_Admin\src\views\demo\47-formula-editor\index.vue
 * @Description: 公式编辑器演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="formula-demo-page">
    <c_vTitle
      title="公式编辑器场景示例"
      icon="mdi:function-variant"
      description="可视化公式编辑器，支持变量点选插入、虚拟键盘、实时语法校验与计算预览，广泛应用于绩效核算、销售提成等场景"
    />

    <!-- 1. 基础用法 — 完整编辑器 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:function-variant"
          class="title-icon"
        />
        基础用法（完整公式编辑器）
      </h2>
      <div class="section-desc">
        左侧面板展示可用变量（分组折叠 +
        搜索过滤）和内置函数，点击即插入到光标位置。
        右侧公式输入区支持直接键盘输入与虚拟键盘点击双模式，变量自动渲染为彩色
        Chip。 底部虚拟键盘分为运算符区域和数字区域，点击即插入对应字符。 传入
        <code>sample-data</code> 后底部实时显示计算结果预览。
      </div>
      <div class="section-content">
        <C_FormulaEditor
          v-model="basicFormula"
          :variables="salesVariables"
          :sample-data="salesSampleData"
          @change="onBasicChange"
          @validation-change="onBasicValidation"
        />
        <div class="demo-output">
          <NTag type="info"> 公式：{{ basicFormula || '(空)' }} </NTag>
          <NTag :type="basicValid ? 'success' : 'error'">
            {{ basicValid ? '✅ 合法' : '❌ 不合法' }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- 2. 绩效核算场景 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:chart-timeline-variant-shimmer"
          class="title-icon"
        />
        绩效核算场景（多档位三元表达式）
      </h2>
      <div class="section-desc">
        模拟真实绩效核算场景：根据完成值所在档位（卓越/优秀/达标），
        使用不同的系数计算绩效得分。公式使用三元表达式
        <code>? :</code> 实现多条件分支判断，
        传入样例数据后可实时验证计算结果是否符合预期。
      </div>
      <div class="section-content">
        <C_FormulaEditor
          v-model="perfFormula"
          :variables="perfVariables"
          :sample-data="perfSampleData"
        />
      </div>
    </div>

    <!-- 3. 精简模式 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:view-compact-outline"
          class="title-icon"
        />
        精简模式（仅输入区 + 预览）
      </h2>
      <div class="section-desc">
        通过 <code>:show-variable-panel="false"</code> 和
        <code>:show-keyboard="false"</code> 关闭侧边面板和虚拟键盘，
        仅保留公式输入区和计算预览。适合弹窗、抽屉等空间有限的场景，
        用户通过键盘直接输入 <code>[变量名]</code> 编辑公式。
      </div>
      <div class="section-content">
        <C_FormulaEditor
          v-model="compactFormula"
          :variables="salesVariables"
          :sample-data="salesSampleData"
          :show-variable-panel="false"
          :show-keyboard="false"
        />
      </div>
    </div>

    <!-- 4. 编程式控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:code-braces"
          class="title-icon"
        />
        编程控制（Expose API）
      </h2>
      <div class="section-desc">
        通过 <code>ref</code> 获取组件实例，调用 <code>insertAtCursor</code> /
        <code>getValue</code> / <code>reset</code> /
        <code>validate</code> 方法，
        实现外部程序对编辑器的控制。适合表单联动、规则模板预填等场景。
      </div>
      <div class="section-content">
        <C_FormulaEditor
          ref="programRef"
          v-model="programFormula"
          :variables="salesVariables"
          :sample-data="salesSampleData"
        />
        <NSpace
          :size="8"
          style="margin-top: 12px"
        >
          <NButton
            type="primary"
            size="small"
            @click="programRef?.insertAtCursor('[销售额]')"
          >
            插入「销售额」
          </NButton>
          <NButton
            size="small"
            @click="programRef?.insertAtCursor(' / ')"
          >
            插入 ÷
          </NButton>
          <NButton
            size="small"
            @click="programRef?.insertAtCursor('[目标额]')"
          >
            插入「目标额」
          </NButton>
          <NButton
            size="small"
            @click="programRef?.insertAtCursor(' * 100')"
          >
            插入 ×100
          </NButton>
          <NButton
            size="small"
            @click="handleGetValue"
          >
            获取当前值
          </NButton>
          <NButton
            size="small"
            @click="handleValidate"
          >
            手动校验
          </NButton>
          <NButton
            size="small"
            @click="programRef?.reset()"
          >
            重置
          </NButton>
        </NSpace>
      </div>
    </div>

    <!-- 5. 内置函数演示 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:math-integral-box"
          class="title-icon"
        />
        内置函数演示
      </h2>
      <div class="section-desc">
        支持 12 个内置函数：
        <code>IF</code> / <code>AND</code> / <code>OR</code> /
        <code>NOT</code>（逻辑类）、 <code>SUM</code> / <code>AVG</code> /
        <code>MAX</code> / <code>MIN</code>（聚合类）、 <code>ABS</code> /
        <code>ROUND</code> / <code>CEIL</code> / <code>FLOOR</code>（数学类）。
        在左侧面板切换到「常用函数」Tab 即可查看函数签名和说明，点击插入。
      </div>
      <div class="section-content">
        <C_FormulaEditor
          v-model="funcFormula"
          :variables="gradeVariables"
          :sample-data="gradeSampleData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormulaEditorExpose,
    FormulaValidation,
  } from '@robot-admin/naive-ui-components'
  import {
    salesVariables,
    salesSampleData,
    perfVariables,
    perfSampleData,
    gradeVariables,
    gradeSampleData,
    DEFAULT_BASIC_FORMULA,
    DEFAULT_PERF_FORMULA,
    DEFAULT_COMPACT_FORMULA,
    DEFAULT_FUNC_FORMULA,
  } from './data'

  const message = useMessage()

  // ─── 1. 基础用法 ──────────────────────────────

  const basicFormula = ref(DEFAULT_BASIC_FORMULA)
  const basicValid = ref(true)

  /** 公式变更 */
  function onBasicChange(value: string) {
    console.log('[Formula] 公式变更:', value)
  }

  /** 校验变更 */
  function onBasicValidation(result: FormulaValidation) {
    basicValid.value = result.valid
  }

  // ─── 2. 绩效核算 ──────────────────────────────

  const perfFormula = ref(DEFAULT_PERF_FORMULA)

  // ─── 3. 精简模式 ──────────────────────────────

  const compactFormula = ref(DEFAULT_COMPACT_FORMULA)

  // ─── 4. 编程控制 ──────────────────────────────

  const programRef = ref<FormulaEditorExpose>()
  const programFormula = ref('')

  /** 获取值 */
  function handleGetValue() {
    const value = programRef.value?.getValue()
    message.success(`当前公式：${value || '(空)'}`)
  }

  /** 手动校验 */
  function handleValidate() {
    const result = programRef.value?.validate()
    if (result?.valid) {
      message.success('校验通过')
    } else {
      message.error(`校验失败：${result?.message}`)
    }
  }

  // ─── 5. 函数演示 ──────────────────────────────

  const funcFormula = ref(DEFAULT_FUNC_FORMULA)
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
