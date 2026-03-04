<template>
  <div class="activity-log-page">
    <!-- 搜索栏 -->
    <NCard
      class="search-card"
      :bordered="true"
    >
      <div class="search-bar">
        <NInput
          v-model:value="searchForm.keyword"
          placeholder="搜索操作描述、模块名称..."
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <span
              class="i-mdi:magnify"
              style="font-size: 16px; color: #9ca3af"
            />
          </template>
        </NInput>
        <NSelect
          v-model:value="searchForm.actionType"
          placeholder="操作类型"
          clearable
          style="width: 120px"
          :options="ACTION_TYPE_OPTIONS"
          @update:value="handleSearch"
        />
        <NSelect
          v-model:value="searchForm.result"
          placeholder="执行结果"
          clearable
          style="width: 120px"
          :options="RESULT_OPTIONS"
          @update:value="handleSearch"
        />
        <NDatePicker
          v-model:value="searchForm.dateRange"
          type="daterange"
          clearable
          style="width: 260px"
          @update:value="handleSearch"
        />
        <NButton
          type="primary"
          @click="handleSearch"
        >
          <template #icon>
            <span class="i-mdi:magnify" />
          </template>
          查询
        </NButton>
        <NButton @click="handleReset">
          <template #icon>
            <span class="i-mdi:refresh" />
          </template>
          重置
        </NButton>
      </div>
    </NCard>

    <!-- 统计概览 -->
    <NCard
      :bordered="true"
      :content-style="{ padding: '16px' }"
    >
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-icon stat-total">
            <span class="i-mdi:format-list-bulleted" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总操作数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-success">
            <span class="i-mdi:check-circle-outline" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.success }}</div>
            <div class="stat-label">成功</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-failed">
            <span class="i-mdi:close-circle-outline" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.failed }}</div>
            <div class="stat-label">失败</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-today">
            <span class="i-mdi:calendar-today" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.today }}</div>
            <div class="stat-label">今日操作</div>
          </div>
        </div>
      </div>
    </NCard>

    <!-- 操作日志表格 -->
    <NCard
      class="table-card"
      :bordered="true"
    >
      <NDataTable
        :columns="columns"
        :data="filteredRecords"
        :bordered="false"
        :pagination="pagination"
        striped
        size="small"
        flex-height
        style="height: 100%"
      />
    </NCard>
  </div>
</template>

<script setup lang="ts">
  import {
    NCard,
    NInput,
    NSelect,
    NButton,
    NDatePicker,
    NDataTable,
  } from 'naive-ui/es'
  import {
    MOCK_ACTIVITY_RECORDS,
    ACTION_TYPE_OPTIONS,
    RESULT_OPTIONS,
    createColumns,
    type ActivitySearchForm,
  } from './data'

  defineOptions({ name: 'AccountActivityLog' })

  // 搜索表单
  const searchForm = reactive<ActivitySearchForm>({
    keyword: '',
    actionType: null,
    result: null,
    dateRange: null,
  })

  // 表格列
  const columns = createColumns()

  // 分页
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    onChange: (page: number) => {
      pagination.page = page
    },
    onUpdatePageSize: (pageSize: number) => {
      pagination.pageSize = pageSize
      pagination.page = 1
    },
  })

  // 全部记录（Mock）
  const allRecords = ref([...MOCK_ACTIVITY_RECORDS])

  // 过滤后的记录
  const filteredRecords = computed(() => {
    let data = [...allRecords.value]

    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      data = data.filter(
        r =>
          r.description.toLowerCase().includes(kw) ||
          r.module.toLowerCase().includes(kw)
      )
    }

    if (searchForm.actionType) {
      data = data.filter(r => r.actionType === searchForm.actionType)
    }

    if (searchForm.result) {
      data = data.filter(r => r.result === searchForm.result)
    }

    if (searchForm.dateRange) {
      const [start, end] = searchForm.dateRange
      data = data.filter(r => {
        const t = new Date(r.time).getTime()
        return t >= start && t <= end + 86400000
      })
    }

    return data
  })

  // 统计
  const stats = computed(() => {
    const all = allRecords.value
    const todayStr = new Date().toISOString().slice(0, 10)
    return {
      total: all.length,
      success: all.filter(r => r.result === 'success').length,
      failed: all.filter(r => r.result === 'failed').length,
      today: all.filter(r => r.time.startsWith(todayStr)).length,
    }
  })

  /** 搜索 */
  const handleSearch = () => {
    pagination.page = 1
  }

  /** 重置 */
  const handleReset = () => {
    searchForm.keyword = ''
    searchForm.actionType = null
    searchForm.result = null
    searchForm.dateRange = null
    pagination.page = 1
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
