<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-10 10:57:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-17 08:36:59
 * @FilePath: \Robot_Admin\src\views\demo\09-form-search\index.vue
 * @Description: 表单搜索组件 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="search-demo">
    <NH1 class="main-title">表单搜索组件场景示例</NH1>
    <!-- 基础用法 -->
    <div class="demo-section">
      <h3>基础用法（3个字段）</h3>
      <C_FormSearch
        :form-item-list="basicFormConfig.items"
        :form-params="basicFormParams"
        :form-search-input-history-string="basicFormConfig.historyKey"
        @search="handleBasicSearch"
        @reset="handleBasicReset"
        @change-params="handleParamsChange"
      />
    </div>

    <!-- 高级用法 -->
    <div class="demo-section">
      <h3>高级用法（12个字段 - 默认显示8个，展开显示全部）</h3>
      <C_FormSearch
        :form-item-list="advancedFormConfig.items"
        :form-params="advancedFormParams"
        :form-search-input-history-string="advancedFormConfig.historyKey"
        @search="handleAdvancedSearch"
        @reset="handleAdvancedReset"
      />
    </div>

    <!-- 超多字段测试 -->
    <div class="demo-section">
      <h3>超多字段测试（16个字段）</h3>
      <C_FormSearch
        :form-item-list="megaFormConfig.items"
        :form-params="megaFormParams"
        :form-search-input-history-string="megaFormConfig.historyKey"
        @search="handleMegaSearch"
        @reset="handleMegaReset"
      />
    </div>

    <!-- 搜索结果展示 -->
    <div
      class="demo-section"
      v-if="searchResults.length > 0"
    >
      <h3>搜索结果</h3>
      <NCard>
        <pre>{{ JSON.stringify(searchResults, null, 2) }}</pre>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    basicFormConfig,
    advancedFormConfig,
    megaFormConfig,
    generateMockResults,
    type BasicFormParams,
    type AdvancedFormParams,
    type MegaFormParams,
    type SearchResult,
  } from './data'
  import type { SearchFormParams } from '@robot-admin/naive-ui-components'

  const message = useMessage()
  const searchResults = ref<SearchResult[]>([])

  // 创建响应式表单参数 - 使用精确类型
  const basicFormParams = reactive<BasicFormParams>({
    ...basicFormConfig.params,
  })
  const advancedFormParams = reactive<AdvancedFormParams>({
    ...advancedFormConfig.params,
  })
  const megaFormParams = reactive<MegaFormParams>({ ...megaFormConfig.params })

  /**
   * * @description: 重置表单参数到初始状态的辅助函数
   * ? @param {T} target 目标表单参数对象
   * ? @param {T} source 源初始参数对象
   * ! @return {void} 无返回值，直接修改目标对象
   */
  function resetFormParams<T extends Record<string, unknown>>(
    target: { [K in keyof T]: T[K] }, // 修改为可写类型
    source: T
  ): void {
    Object.keys(target).forEach(key => {
      target[key as keyof T] = source[key as keyof T]
    })
  }

  /**
   * * @description: 处理基础表单搜索事件
   * ? @param {BasicFormParams} params 基础表单搜索参数
   * ! @return {void} 无返回值，执行搜索并更新结果
   */
  function handleBasicSearch(params: SearchFormParams) {
    console.log('基础搜索参数:', params)
    message.success('搜索成功！')
    searchResults.value = generateMockResults(
      'basic',
      params as BasicFormParams
    )
  }

  /**
   * * @description: 处理基础表单重置事件
   * ! @return {void} 无返回值，重置表单并清空搜索结果
   */
  function handleBasicReset() {
    resetFormParams(basicFormParams, basicFormConfig.params)
    searchResults.value = []
    message.info('表单已重置')
  }

  /**
   * * @description: 处理高级表单搜索事件
   * ? @param {AdvancedFormParams} params 高级表单搜索参数
   * ! @return {void} 无返回值，执行搜索并更新结果
   */
  function handleAdvancedSearch(params: SearchFormParams) {
    console.log('高级搜索参数:', params)
    message.success('高级搜索成功！')
    searchResults.value = generateMockResults(
      'advanced',
      params as AdvancedFormParams
    )
  }

  /**
   * * @description: 处理高级表单重置事件
   * ! @return {void} 无返回值，重置表单并清空搜索结果
   */
  function handleAdvancedReset() {
    resetFormParams(advancedFormParams, advancedFormConfig.params)
    searchResults.value = []
    message.info('高级表单已重置')
  }

  /**
   * * @description: 处理超多字段表单搜索事件
   * ? @param {MegaFormParams} params 超多字段表单搜索参数
   * ! @return {void} 无返回值，执行搜索并更新结果
   */
  function handleMegaSearch(params: SearchFormParams) {
    console.log('超多字段搜索参数:', params)
    message.success('超多字段搜索成功！')
    searchResults.value = generateMockResults('mega', params as MegaFormParams)
  }

  /**
   * * @description: 处理超多字段表单重置事件
   * ! @return {void} 无返回值，重置表单并清空搜索结果
   */
  function handleMegaReset() {
    resetFormParams(megaFormParams, megaFormConfig.params)
    searchResults.value = []
    message.info('超多字段表单已重置')
  }

  /**
   * * @description: 处理表单参数变化事件
   * ? @param {BasicFormParams | AdvancedFormParams | MegaFormParams} params 变化的表单参数
   * ! @return {void} 无返回值，仅用于日志记录和调试
   */
  function handleParamsChange(params: SearchFormParams) {
    console.log('参数变化:', params)
  }
</script>

<style lang="scss" scoped>
  .search-demo {
    padding: 20px;

    h2 {
      color: var(--n-text-color);
      margin-bottom: 24px;
      text-align: center;
    }

    .demo-section {
      margin-bottom: 40px;

      h3 {
        color: var(--n-text-color);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--n-primary-color);
        font-size: 16px;
      }
    }

    pre {
      background: var(--n-code-color);
      padding: 16px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
    }
  }
</style>
