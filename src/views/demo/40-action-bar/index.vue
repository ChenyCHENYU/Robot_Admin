<template>
  <div class="action-bar-demo-page">
    <c_vTitle
      title="操作按钮组场景示例"
      icon="mdi:gesture-tap-button"
      description="支持多种场景：表格工具栏、表单操作、详情页头部、步骤导航、响应式状态、下拉菜单等"
    />

    <!-- 场景一：表格工具栏 -->
    <NCard
      title="表格工具栏"
      class="mb-6"
    >
      <template #header-extra>
        <NText depth="3">新增/删除/刷新 + 中间显示选中数</NText>
      </template>

      <C_ActionBar
        :actions="tableActions"
        @action-click="handleActionClick"
      >
        <template #center>
          <NSpace
            v-if="selectedCount > 0"
            align="center"
          >
            <NText depth="3">已选择:</NText>
            <NTag
              type="primary"
              :bordered="false"
            >
              {{ selectedCount }} 条
            </NTag>
            <NButton
              text
              size="small"
              @click="selectedCount = 0"
            >
              清空
            </NButton>
          </NSpace>
        </template>
      </C_ActionBar>

      <C_Table
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :row-key="(row: any) => row.id"
        :config="{ selection: { enabled: true }, pagination: false }"
        @update:checked-row-keys="handleSelectionChange"
      />
    </NCard>

    <!-- 两列布局 -->
    <NGrid
      :cols="2"
      :x-gap="24"
      :y-gap="24"
    >
      <!-- 场景二：表单操作栏 -->
      <NGridItem>
        <NCard
          title="表单操作栏"
          class="h-full"
        >
          <template #header-extra>
            <NText depth="3">居中对齐</NText>
          </template>
          <div class="card-content">
            <NForm
              label-placement="left"
              label-width="80"
            >
              <NFormItem label="用户名">
                <NInput
                  v-model:value="formData.username"
                  placeholder="请输入"
                />
              </NFormItem>
              <NFormItem label="邮箱">
                <NInput
                  v-model:value="formData.email"
                  placeholder="请输入"
                />
              </NFormItem>
            </NForm>
            <C_ActionBar
              :actions="formActions"
              :config="{ align: 'center' }"
              @action-click="handleActionClick"
            />
          </div>
        </NCard>
      </NGridItem>

      <!-- 场景三：详情页头部 -->
      <NGridItem>
        <NCard
          title="详情页头部"
          class="h-full"
        >
          <template #header-extra>
            <NText depth="3">分隔线样式</NText>
          </template>
          <div class="card-content">
            <NDescriptions
              label-placement="left"
              :column="2"
            >
              <NDescriptionsItem label="姓名">张三</NDescriptionsItem>
              <NDescriptionsItem label="部门">技术部</NDescriptionsItem>
              <NDescriptionsItem label="职位">前端工程师</NDescriptionsItem>
              <NDescriptionsItem label="状态">在职</NDescriptionsItem>
            </NDescriptions>
            <C_ActionBar
              :actions="detailActions"
              :config="{ showDivider: true }"
              class="mt-14"
              @action-click="handleActionClick"
            />
          </div>
        </NCard>
      </NGridItem>

      <!-- 场景四：步骤条导航 -->
      <NGridItem>
        <NCard
          title="步骤条导航"
          class="h-full"
        >
          <template #header-extra>
            <NText depth="3">上一步/下一步</NText>
          </template>
          <div class="card-content">
            <NSteps
              :current="currentStep"
              size="small"
            >
              <NStep title="基础信息" />
              <NStep title="详细设置" />
              <NStep title="完成" />
            </NSteps>
            <C_ActionBar
              :actions="stepActions"
              class="mt-4"
              @action-click="handleActionClick"
            />
          </div>
        </NCard>
      </NGridItem>

      <!-- 场景五：响应式状态 -->
      <NGridItem>
        <NCard
          title="响应式按钮状态"
          class="h-full"
        >
          <template #header-extra>
            <NText depth="3">loading/disabled/show</NText>
          </template>
          <div class="card-content">
            <NSpace class="mb-4">
              <NCheckbox v-model:checked="states.hasSelection"
                >已选择数据</NCheckbox
              >
              <NCheckbox v-model:checked="states.isEditing">编辑模式</NCheckbox>
            </NSpace>
            <C_ActionBar
              :actions="reactiveActionsSimple"
              @action-click="handleActionClick"
            />
          </div>
        </NCard>
      </NGridItem>

      <!-- 场景六：下拉菜单 -->
      <NGridItem>
        <NCard
          title="下拉菜单按钮"
          class="h-full"
        >
          <template #header-extra>
            <NText depth="3">dropdown 配置</NText>
          </template>
          <div class="card-content">
            <p class="hint-text">
              点击下方按钮的「更多」或「设置」查看下拉菜单
            </p>
            <C_ActionBar
              :actions="dropdownActionsSimple"
              class="mt-4"
              @action-click="handleActionClick"
              @dropdown-click="handleDropdownClick"
            />
          </div>
        </NCard>
      </NGridItem>

      <!-- 场景七：配置选项 -->
      <NGridItem>
        <NCard
          title="配置选项"
          class="h-full"
        >
          <template #header-extra>
            <NText depth="3">动态调整</NText>
          </template>
          <div class="card-content">
            <NSpace
              align="center"
              :size="16"
            >
              <NSpace align="center">
                <span class="config-label">对齐:</span>
                <NRadioGroup
                  v-model:value="customConfig.align"
                  size="small"
                >
                  <NRadio value="left">左</NRadio>
                  <NRadio value="center">中</NRadio>
                  <NRadio value="right">右</NRadio>
                  <NRadio value="space-between">两端</NRadio>
                </NRadioGroup>
              </NSpace>
              <NDivider vertical />
              <NSpace :size="12">
                <NCheckbox v-model:checked="customConfig.showDivider"
                  >分隔线</NCheckbox
                >
                <NCheckbox v-model:checked="customConfig.compact"
                  >紧凑</NCheckbox
                >
                <NCheckbox v-model:checked="customConfig.wrap">换行</NCheckbox>
              </NSpace>
            </NSpace>
            <C_ActionBar
              :actions="basicActions"
              :config="customConfig"
              class="mt-4"
              @action-click="handleActionClick"
            />
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import type {
    ActionItem,
    ActionDropdownItem,
  } from '@robot-admin/naive-ui-components'
  import { useMessage } from 'naive-ui/es'
  import {
    columns,
    MOCK_TABLE_DATA,
    DEFAULT_CUSTOM_CONFIG,
    MORE_DROPDOWN_ITEMS,
    SETTINGS_DROPDOWN_ITEMS,
  } from './data'

  const message = useMessage()

  // 状态管理
  const loading = ref(false)
  const selectedCount = ref(0)
  const currentStep = ref(0)
  const states = reactive({
    hasSelection: false,
    isEditing: false,
    isRefreshing: false,
  })
  const formData = reactive({ username: '', email: '' })
  const customConfig = reactive({ ...DEFAULT_CUSTOM_CONFIG })
  const tableData = ref([...MOCK_TABLE_DATA])

  // 场景一：表格工具栏
  const tableActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      onClick: () => {
        message.success('新增用户')
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      disabled: selectedCount.value === 0,
      onClick: () => {
        message.warning(`删除 ${selectedCount.value} 条数据`)
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      onClick: handleRefresh,
    },
  ])

  // 场景二：表单操作栏
  const formActions = computed<ActionItem[]>(() => [
    {
      key: 'save-draft',
      label: '草稿',
      icon: 'mdi:content-save-outline',
      onClick: () => {
        message.info('保存草稿')
      },
    },
    {
      key: 'reset',
      label: '重置',
      icon: 'mdi:refresh',
      onClick: () => {
        formData.username = ''
        formData.email = ''
        message.warning('表单已重置')
      },
    },
    {
      key: 'submit',
      label: '提交',
      icon: 'mdi:check',
      type: 'primary',
      onClick: async () => {
        loading.value = true
        await new Promise(r => setTimeout(r, 1000))
        loading.value = false
        message.success('提交成功')
      },
    },
  ])

  // 场景三：详情页头部
  const detailActions = computed<ActionItem[]>(() => [
    {
      key: 'back',
      label: '返回',
      icon: 'mdi:arrow-left',
      onClick: () => {
        message.info('返回列表')
      },
    },
    {
      key: 'edit',
      label: '编辑',
      icon: 'mdi:pencil',
      type: 'primary',
      onClick: () => {
        message.info('进入编辑')
      },
    },
    {
      key: 'print',
      label: '打印',
      icon: 'mdi:printer',
      onClick: () => {
        message.info('打印')
      },
    },
    {
      key: 'share',
      label: '分享',
      icon: 'mdi:share-variant',
      onClick: () => {
        message.info('分享')
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      onClick: () => {
        message.error('删除')
      },
    },
  ])

  // 场景四：步骤条导航
  const stepActions = computed<ActionItem[]>(() => [
    {
      key: 'prev',
      label: '上一步',
      icon: 'mdi:arrow-left',
      disabled: currentStep.value === 0,
      onClick: () => {
        currentStep.value--
        message.info(`步骤 ${currentStep.value + 1}`)
      },
    },
    {
      key: 'skip',
      label: '跳过',
      icon: 'mdi:skip-next',
      show: currentStep.value < 2,
      onClick: () => {
        currentStep.value = 2
        message.warning('跳过')
      },
    },
    {
      key: 'next',
      label: currentStep.value === 2 ? '完成' : '下一步',
      icon: currentStep.value === 2 ? 'mdi:check' : 'mdi:arrow-right',
      type: 'primary',
      onClick: () => {
        if (currentStep.value === 2) {
          currentStep.value = 0
          message.success('完成')
        } else {
          currentStep.value++
          message.info(`步骤 ${currentStep.value + 1}`)
        }
      },
    },
  ])

  // 场景五：响应式按钮
  const reactiveActionsSimple = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      disabled: states.isEditing,
      onClick: () => {
        message.success('新增')
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      disabled: computed(() => !states.hasSelection),
      show: computed(() => states.hasSelection),
      onClick: () => {
        message.error('删除')
      },
    },
    {
      key: 'edit',
      label: states.isEditing ? '保存' : '编辑',
      icon: states.isEditing ? 'mdi:check' : 'mdi:pencil',
      type: states.isEditing ? 'success' : 'warning',
      onClick: () => {
        states.isEditing = !states.isEditing
        message.warning(states.isEditing ? '编辑模式' : '保存')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      loading: computed(() => states.isRefreshing),
      onClick: async () => {
        states.isRefreshing = true
        await new Promise(r => setTimeout(r, 2000))
        states.isRefreshing = false
        message.success('刷新完成')
      },
    },
  ])

  // 场景六：下拉菜单（子选项配置来自 data.ts，回调由 handleDropdownClick 统一分发）
  const dropdownActionsSimple = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      onClick: () => {
        message.success('新增')
      },
    },
    {
      key: 'more',
      label: '更多',
      icon: 'mdi:dots-horizontal',
      dropdown: MORE_DROPDOWN_ITEMS,
    },
    {
      key: 'settings',
      label: '设置',
      icon: 'mdi:cog',
      dropdown: SETTINGS_DROPDOWN_ITEMS,
    },
  ])

  // 场景七：配置选项
  const basicActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      onClick: () => {
        message.success('新增')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      onClick: handleRefresh,
    },
  ])

  // 事件处理
  const handleActionClick = (action: ActionItem) =>
    console.log('Action:', action)
  const handleDropdownClick = (item: ActionDropdownItem) => {
    const msgMap: Record<string, () => void> = {
      'export-excel': () => message.success('导出Excel'),
      'export-pdf': () => message.success('导出PDF'),
      print: () => message.info('打印'),
      column: () => message.info('列设置'),
      filter: () => message.info('筛选'),
    }
    msgMap[item.key]?.()
  }

  const handleRefresh = async () => {
    loading.value = true
    await new Promise(r => setTimeout(r, 1500))
    loading.value = false
    message.success('刷新成功')
  }

  const handleSelectionChange = (keys: Array<string | number>) => {
    selectedCount.value = keys.length
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
