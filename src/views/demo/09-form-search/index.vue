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
        :form-item-list="example.config.items"
        :form-params="example.params"
        :form-search-input-history-string="example.config.historyKey"
        @search="handleSearch(type, $event)"
        @reset="handleReset(type)"
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
  import type { SearchFormParams } from '@robot-admin/naive-ui-components'
  import {
    type SearchResult,
    basicFormConfig,
    advancedFormConfig,
    megaFormConfig,
    generateMockResults,
    resetFormParams,
  } from './data'

  const message = useMessage()
  const searchResults = ref<SearchResult[]>([])

  // 表单参数
  const basicFormParams = reactive({ ...basicFormConfig.params })
  const advancedFormParams = reactive({ ...advancedFormConfig.params })
  const megaFormParams = reactive({ ...megaFormConfig.params })

  // 表单配置映射
  const formConfigs = {
    basic: {
      title: '基础用法（3个字段）',
      config: basicFormConfig,
      params: basicFormParams,
      defaults: basicFormConfig.params,
    },
    advanced: {
      title: '高级用法（12个字段 - 默认显示8个，展开显示全部）',
      config: advancedFormConfig,
      params: advancedFormParams,
      defaults: advancedFormConfig.params,
    },
    mega: {
      title: '超多字段测试（16个字段）',
      config: megaFormConfig,
      params: megaFormParams,
      defaults: megaFormConfig.params,
    },
  }

  // 统一搜索处理
  const handleSearch = (
    type: keyof typeof formConfigs,
    params: SearchFormParams
  ) => {
    message.info('搜索条件已接收（演示结果）')
    searchResults.value = generateMockResults(type, params)
  }

  // 统一重置处理
  const handleReset = (type: keyof typeof formConfigs) => {
    const { params, defaults } = formConfigs[type]
    resetFormParams(params, defaults)
    searchResults.value = []
    message.info('表单已重置')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
