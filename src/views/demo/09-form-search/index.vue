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

    <!-- 基础用法 -->
    <div class="demo-section">
      <h3>基础用法（3个字段）</h3>
      <C_FormSearch
        :form-item-list="basicFormConfig.items"
        :form-params="basicFormParams"
        :form-search-input-history-string="basicFormConfig.historyKey"
        @search="handleSearch('basic', $event)"
        @reset="handleReset('basic')"
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
        @search="handleSearch('advanced', $event)"
        @reset="handleReset('advanced')"
      />
    </div>

    <!-- 超多字段测试 -->
    <div class="demo-section">
      <h3>超多字段测试（16个字段）</h3>
      <C_FormSearch
        :form-item-list="megaFormConfig.items"
        :form-params="megaFormParams"
        :form-search-input-history-string="megaFormConfig.historyKey"
        @search="handleSearch('mega', $event)"
        @reset="handleReset('mega')"
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
  import type { SearchFormParams } from '@robot-admin/naive-ui-components'
  import {
    basicFormConfig,
    advancedFormConfig,
    megaFormConfig,
    generateMockResults,
    resetFormParams,
  } from './data'

  const message = useMessage()
  const searchResults = ref<any[]>([])

  // 表单参数
  const basicFormParams = reactive({ ...basicFormConfig.params })
  const advancedFormParams = reactive({ ...advancedFormConfig.params })
  const megaFormParams = reactive({ ...megaFormConfig.params })

  // 表单配置映射
  const formConfigs = {
    basic: { params: basicFormParams, defaults: basicFormConfig.params },
    advanced: {
      params: advancedFormParams,
      defaults: advancedFormConfig.params,
    },
    mega: { params: megaFormParams, defaults: megaFormConfig.params },
  }

  // 统一搜索处理
  const handleSearch = (
    type: keyof typeof formConfigs,
    params: SearchFormParams
  ) => {
    console.log(`${type}搜索参数:`, params)
    message.success('搜索成功！')
    searchResults.value = generateMockResults(type, params as any)
  }

  // 统一重置处理
  const handleReset = (type: keyof typeof formConfigs) => {
    const { params, defaults } = formConfigs[type]
    resetFormParams(params, defaults)
    searchResults.value = []
    message.info('表单已重置')
  }

  // 参数变化
  const handleParamsChange = (params: SearchFormParams) => {
    console.log('参数变化:', params)
  }
</script>

<style lang="scss" scoped>
  .form-search-demo {
    padding: 20px;

    .demo-section {
      margin-bottom: 32px;

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
