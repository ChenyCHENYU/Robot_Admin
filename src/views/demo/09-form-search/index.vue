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

    <NCard
      class="density-controls"
      size="small"
    >
      <NSpace
        align="center"
        justify="space-between"
      >
        <div>
          <strong>搜索与表格统一密度</strong>
          <p>切换后字段、按钮与表格同步调整，已输入的条件保持不变。</p>
        </div>
        <NRadioGroup
          v-model:value="density"
          name="searchDensity"
        >
          <NRadioButton
            v-for="item in DENSITY_OPTIONS"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </NRadioButton>
        </NRadioGroup>
      </NSpace>
    </NCard>

    <div
      v-for="(example, type) in formConfigs"
      :key="type"
      class="demo-section"
    >
      <h3>{{ example.title }}</h3>
      <C_FormSearch
        v-model="example.params"
        :form-item-list="example.config.items"
        :config="{ ...example.searchConfig, density }"
        :form-search-input-history-string="example.config.historyKey"
        @reset="handleReset(type)"
      />
      <C_Table
        v-if="type === 'basic'"
        class="search-result-table"
        :columns="previewColumns"
        :data="basicRows"
        row-key="id"
        :config="{ density, toolbar: { show: false }, pagination: false }"
      />
    </div>

    <div class="demo-section selection-search-demo">
      <h3>多选与布尔条件</h3>
      <p
        >账号状态可多选；是否可用支持清空。点击搜索更新列表，重置恢复「不可用」。</p
      >
      <C_FormSearch
        v-model="selectionParams"
        :form-item-list="SELECTION_SEARCH_FIELDS"
        :config="{ density, requireValue: false, onSearch: searchSelection }"
        @reset="searchSelection"
      />
      <C_Table
        class="search-result-table"
        :columns="previewColumns"
        :data="selectionRows"
        :config="{ density, toolbar: { show: false }, pagination: false }"
      />
      <pre data-testid="selection-submitted">{{
        JSON.stringify(selectionSubmitted, null, 2)
      }}</pre>
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
    ComponentDensity,
  } from '@robot-admin/naive-ui-components/C_FormSearch'
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
  import {
    type SearchResult,
    basicFormConfig,
    advancedFormConfig,
    megaFormConfig,
    generateMockResults,
    createSearchFields,
    DENSITY_OPTIONS,
    SEARCH_PREVIEW_ROWS,
    filterSearchPreview,
    type SearchPreviewRow,
    SELECTION_SEARCH_FIELDS,
    filterSelectionPreview,
  } from './data'

  const message = useMessage()
  const searchResults = ref<SearchResult[]>([])
  const density = ref<ComponentDensity>('compact')
  const basicRows = ref<SearchPreviewRow[]>([...SEARCH_PREVIEW_ROWS])
  const previewColumns: TableColumn<SearchPreviewRow>[] = [
    { type: 'index', title: '序号', width: 64 },
    { key: 'name', title: '姓名', minWidth: 120 },
    {
      key: 'status',
      title: '状态',
      width: 100,
      render: row => ['禁用', '启用', '待审核'][row.status] ?? '未知',
    },
    {
      key: 'createdAt',
      title: '创建时间',
      minWidth: 180,
      render: row => new Date(row.createdAt).toLocaleString('zh-CN'),
    },
  ]

  const selectionParams = ref<SearchFormParams>({
    statuses: [],
    enabled: false,
  })
  const selectionSubmitted = ref<SearchFormParams>({
    statuses: [],
    enabled: false,
  })
  const selectionRows = ref(filterSelectionPreview(selectionSubmitted.value))
  /** 列表只使用已提交条件，保留输入草稿与查询结果的边界。 */
  const searchSelection = (params: SearchFormParams) => {
    selectionSubmitted.value = structuredClone(toRaw(params))
    selectionRows.value = filterSelectionPreview(params)
  }

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
    if (type === 'basic') {
      basicRows.value = filterSearchPreview(params)
      searchResults.value = basicRows.value
    } else searchResults.value = generateMockResults(type, params)
  }

  // 统一重置处理
  const handleReset = (type: keyof typeof formConfigs) => {
    if (type === 'basic') basicRows.value = [...SEARCH_PREVIEW_ROWS]
    searchResults.value = []
    message.info('表单已重置')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
