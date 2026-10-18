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
  <div class="form-search-demo">
    <c_vTitle
      title="表单搜索组件场景示例"
      icon="mdi:magnify"
      description="支持基础搜索、高级搜索、超多字段搜索，自动折叠展开、历史记录等功能"
    />

    <div
      v-for="(example, type) in formConfigs"
      :key="type"
      class="demo-section"
    >
      <h3>{{ example.title }}</h3>
      <C_FormSearch
        v-model="example.params"
        :form-item-list="example.config.items"
        :config="example.searchConfig"
        :form-search-input-history-string="example.config.historyKey"
        @reset="handleReset"
      />
    </div>

    <!-- 搜索结果 -->
    <div
      v-if="searchResults.length > 0"
      class="demo-section"
    >
      <h3>搜索结果</h3>
      <NCard>
        <pre>{{ JSON.stringify(searchResults, null, 2) }}</pre>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo09FormSearch' })
  import type {
    SearchConfig,
    SearchFormParams,
  } from '@robot-admin/naive-ui-components/C_FormSearch'
  import {
    type SearchResult,
    basicFormConfig,
    advancedFormConfig,
    megaFormConfig,
    generateMockResults,
    createSearchFields,
  } from './data'

  const message = useMessage()
  const searchResults = ref<SearchResult[]>([])

  // onSearch 返回完整任务；search 事件只用于通知，避免同一查询执行两次。
  const searchConfig = (type: 'basic' | 'advanced' | 'mega'): SearchConfig => ({
    foldThreshold: 8,
    onSearch: params => handleSearch(type, params),
  })

  const formConfigs = reactive({
    basic: {
      title: '基础用法（3个字段）',
      config: {
        ...basicFormConfig,
        items: createSearchFields(basicFormConfig),
      },
      params: { ...basicFormConfig.params },
      searchConfig: searchConfig('basic'),
    },
    advanced: {
      title: '高级用法（12个字段 - 默认显示8个，展开显示全部）',
      config: {
        ...advancedFormConfig,
        items: createSearchFields(advancedFormConfig),
      },
      params: { ...advancedFormConfig.params },
      searchConfig: searchConfig('advanced'),
    },
    mega: {
      title: '超多字段测试（16个字段）',
      config: { ...megaFormConfig, items: createSearchFields(megaFormConfig) },
      params: { ...megaFormConfig.params },
      searchConfig: searchConfig('mega'),
    },
  })

  // 统一搜索处理
  const handleSearch = (
    type: keyof typeof formConfigs,
    params: SearchFormParams
  ) => {
    message.info('搜索条件已接收（演示结果）')
    searchResults.value = generateMockResults(type, params)
  }

  // 统一重置处理
  const handleReset = () => {
    searchResults.value = []
    message.info('表单已重置')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
