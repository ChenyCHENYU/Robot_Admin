<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 单实例规则试算工作台，项目只管理场景与扁平配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
-->
<template>
  <div class="formula-demo-page">
    <header class="formula-demo-page__intro"
      ><div
        ><span class="formula-demo-page__eyebrow">LOGIC / PLAYGROUND</span
        ><h1>把规则写清楚，把结果算明白。</h1
        ><p
          >从交付、质量和构建场景理解公式。修改输入值，立即验证不同条件下的结果。</p
        ></div
      ><NTag
        size="small"
        :bordered="false"
        >示例试算 · 不代表项目实时数据</NTag
      ></header
    >
    <nav
      class="formula-demo-page__scenarios"
      aria-label="公式使用场景"
      ><button
        v-for="item in formulaScenarios"
        :key="item.id"
        type="button"
        :aria-pressed="scenario.id === item.id"
        @click="selectScenario(item.id)"
        ><strong>{{ item.label }}</strong
        ><span>{{ item.description }}</span
        ><C_Icon
          name="mdi:arrow-top-right"
          :size="16" /></button
    ></nav>
    <C_FormulaEditor
      :key="scenario.id"
      v-model="formula"
      :config="scenario.config"
    />
    <footer class="formula-demo-page__footer"
      ><p
        >支持数学、聚合与条件函数；语法校验、字符定位和试算都在本地完成。重置恢复当前场景的初始公式与试算值。</p
      ><details
        ><summary>精简接入方式</summary
        ><code
          >&lt;C_FormulaEditor v-model="formula" :config="config" /&gt;</code
        ><p>配置 variables、sampleData 与可选 templates 即可。</p></details
      ></footer
    >
  </div>
</template>
<script setup lang="ts">
  import { formulaScenarios } from './data'
  defineOptions({ name: 'Demo47FormulaEditor' })
  const scenario = ref(formulaScenarios[0]!)
  const formula = ref(scenario.value.expression)
  /** 场景使用独立初始状态，组件内负责编辑和试算反馈。 */
  function selectScenario(id: string): void {
    const selected = formulaScenarios.find(item => item.id === id)
    if (!selected || selected.id === scenario.value.id) return
    scenario.value = selected
    formula.value = selected.expression
  }
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
