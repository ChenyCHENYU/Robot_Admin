<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-14 10:04:02
 * @FilePath: \Robot_Admin\src\views\demo\13-action-bar\index.vue
 * @Description: 通用操作按钮组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="action-bar-demo-page">
    <NH1>操作按钮组场景示例</NH1>

    <NSpace
      vertical
      :size="24"
    >
      <!-- ========== 场景一：表格工具栏 ========== -->
      <NCard
        title="场景一：表格工具栏"
        segmented
      >
        <template #header-extra>
          <NText depth="3">新增/删除/刷新 + 中间显示选中数</NText>
        </template>

        <C_ActionBar
          :left-actions="tableLeftActions"
          :right-actions="tableRightActions"
          @action-click="handleActionClick"
        >
          <template #center>
            <NSpace
              align="center"
              v-if="selectedCount > 0"
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
          :config="{
            selection: { enabled: true },
            pagination: false,
          }"
          @update:checked-row-keys="handleSelectionChange"
        />
      </NCard>

      <!-- ========== 场景二：表单操作栏 ========== -->
      <NCard
        title="场景二：表单操作栏"
        segmented
      >
        <template #header-extra>
          <NText depth="3">提交/重置/保存草稿 + 居中对齐</NText>
        </template>

        <!-- 模拟表单 -->
        <NForm
          label-placement="left"
          label-width="100"
          class="mb-4"
        >
          <NFormItem label="用户名">
            <NInput
              v-model:value="formData.username"
              placeholder="请输入用户名"
            />
          </NFormItem>
          <NFormItem label="邮箱">
            <NInput
              v-model:value="formData.email"
              placeholder="请输入邮箱"
            />
          </NFormItem>
        </NForm>

        <C_ActionBar
          :actions="formActions"
          :config="{ align: 'center', gap: 16 }"
          @action-click="handleActionClick"
        />
      </NCard>

      <!-- ========== 场景三：详情页头部 ========== -->
      <NCard
        title="场景三：详情页头部"
        segmented
      >
        <template #header-extra>
          <NText depth="3">返回/编辑 + 打印/分享/删除</NText>
        </template>

        <C_ActionBar
          :left-actions="detailLeftActions"
          :right-actions="detailRightActions"
          :config="{ showDivider: true }"
          @action-click="handleActionClick"
        />

        <!-- 模拟详情内容 -->
        <NCard
          size="small"
          class="mt-4"
        >
          <NDescriptions
            label-placement="left"
            :column="2"
          >
            <NDescriptionsItem label="姓名">张三</NDescriptionsItem>
            <NDescriptionsItem label="部门">技术部</NDescriptionsItem>
            <NDescriptionsItem label="职位">前端工程师</NDescriptionsItem>
            <NDescriptionsItem label="状态">在职</NDescriptionsItem>
          </NDescriptions>
        </NCard>
      </NCard>

      <!-- ========== 场景四：步骤条导航 ========== -->
      <NCard
        title="场景四：步骤条导航"
        segmented
      >
        <template #header-extra>
          <NText depth="3">上一步/下一步/跳过/完成</NText>
        </template>

        <NSteps
          :current="currentStep"
          class="mb-4"
        >
          <NStep title="基础信息" />
          <NStep title="详细设置" />
          <NStep title="完成" />
        </NSteps>

        <C_ActionBar
          :actions="stepActions"
          :config="{ align: 'space-between' }"
          @action-click="handleActionClick"
        />
      </NCard>

      <!-- ========== 场景五：响应式状态 ========== -->
      <NCard
        title="场景五：响应式按钮状态"
        segmented
      >
        <template #header-extra>
          <NText depth="3">loading / disabled / show 自动响应</NText>
        </template>

        <NSpace
          vertical
          :size="12"
          class="mb-4"
        >
          <NAlert
            type="info"
            :bordered="false"
          >
            <template #icon>
              <C_Icon name="mdi:information" />
            </template>
            尝试点击按钮，观察状态变化：刷新按钮会进入 loading，删除按钮会被禁用
          </NAlert>
          <NSpace>
            <NCheckbox v-model:checked="states.hasSelection">
              模拟已选择数据
            </NCheckbox>
            <NCheckbox v-model:checked="states.isEditing">
              模拟编辑模式
            </NCheckbox>
          </NSpace>
        </NSpace>

        <C_ActionBar
          :actions="reactiveActions"
          @action-click="handleActionClick"
        />

        <C_Table
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :config="{ pagination: false }"
        />
      </NCard>

      <!-- ========== 场景六：下拉菜单 ========== -->
      <NCard
        title="场景六：下拉菜单按钮"
        segmented
      >
        <template #header-extra>
          <NText depth="3">dropdown 属性配置下拉选项</NText>
        </template>

        <C_ActionBar
          :actions="dropdownActions"
          @action-click="handleActionClick"
          @dropdown-click="handleDropdownClick"
        />

        <C_Table
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :config="{ pagination: false }"
        />
      </NCard>

      <!-- ========== 场景七：配置选项 ========== -->
      <NCard
        title="场景七：配置选项展示"
        segmented
      >
        <template #header-extra>
          <NText depth="3">动态调整配置</NText>
        </template>

        <NSpace
          vertical
          :size="12"
          class="mb-4"
        >
          <NSpace>
            <span>对齐方式:</span>
            <NRadioGroup v-model:value="customConfig.align">
              <NRadio value="left">左对齐</NRadio>
              <NRadio value="center">居中</NRadio>
              <NRadio value="right">右对齐</NRadio>
              <NRadio value="space-between">两端对齐</NRadio>
            </NRadioGroup>
          </NSpace>
          <NSpace>
            <span>按钮尺寸:</span>
            <NRadioGroup v-model:value="customConfig.size">
              <NRadio value="tiny">tiny</NRadio>
              <NRadio value="small">small</NRadio>
              <NRadio value="medium">medium</NRadio>
              <NRadio value="large">large</NRadio>
            </NRadioGroup>
          </NSpace>
          <NSpace>
            <NCheckbox v-model:checked="customConfig.showDivider">
              显示分隔线
            </NCheckbox>
            <NCheckbox v-model:checked="customConfig.compact">
              紧凑模式
            </NCheckbox>
            <NCheckbox v-model:checked="customConfig.wrap">
              允许换行
            </NCheckbox>
          </NSpace>
        </NSpace>

        <C_ActionBar
          :actions="basicActions"
          :config="customConfig"
          @action-click="handleActionClick"
        />

        <C_Table
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :config="{ pagination: false }"
        />
      </NCard>

      <!-- ========== 操作日志 ========== -->
      <NCard
        title="操作日志"
        segmented
      >
        <template #header-extra>
          <NButton
            size="small"
            @click="logs = []"
          >
            清空日志
          </NButton>
        </template>

        <NEmpty
          v-if="logs.length === 0"
          description="暂无操作记录"
        />
        <NSpace
          v-else
          vertical
          :size="8"
        >
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="log-item"
          >
            <NTag
              :type="log.type"
              size="small"
              :bordered="false"
            >
              {{ log.time }}
            </NTag>
            <span class="ml-2">{{ log.message }}</span>
          </div>
        </NSpace>
      </NCard>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue'
  import type {
    ActionItem,
    ActionDropdownItem,
  } from '@/types/modules/action-bar'
  import type { TableColumn } from '@/types/modules/table'
  import { useMessage } from 'naive-ui/es'

  const message = useMessage()

  // ================= 状态管理 =================
  const loading = ref(false)
  const selectedCount = ref(0)
  const currentStep = ref(0)
  const logs = ref<Array<{ time: string; message: string; type: string }>>([])

  const states = reactive({
    hasSelection: false,
    isEditing: false,
    isRefreshing: false,
  })

  const formData = reactive({
    username: '',
    email: '',
  })

  const customConfig = reactive({
    align: 'space-between' as any,
    size: 'medium' as any,
    showDivider: false,
    compact: false,
    wrap: false,
  })

  // ================= 表格数据 =================
  const columns: TableColumn[] = [
    { title: 'ID', key: 'id', width: 80 },
    { title: '姓名', key: 'name' },
    { title: '部门', key: 'department' },
    { title: '职位', key: 'role' },
    { title: '状态', key: 'status' },
  ]

  const tableData = ref([
    {
      id: 1,
      name: '张三',
      department: '技术部',
      role: '前端工程师',
      status: '在职',
    },
    {
      id: 2,
      name: '李四',
      department: '产品部',
      role: '产品经理',
      status: '在职',
    },
    {
      id: 3,
      name: '王五',
      department: '设计部',
      role: 'UI设计师',
      status: '在职',
    },
  ])

  // ================= 场景一：表格工具栏 =================
  const tableLeftActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      onClick: () => addLog('新增用户', 'success'),
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      disabled: selectedCount.value === 0,
      onClick: () => addLog(`删除 ${selectedCount.value} 条数据`, 'warning'),
    },
  ])

  const tableRightActions = computed<ActionItem[]>(() => [
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      onClick: handleRefresh,
    },
  ])

  // ================= 场景二：表单操作栏 =================
  const formActions = computed<ActionItem[]>(() => [
    {
      key: 'save-draft',
      label: '保存草稿',
      icon: 'mdi:content-save-outline',
      onClick: () => addLog('保存草稿成功', 'info'),
    },
    {
      key: 'reset',
      label: '重置',
      icon: 'mdi:refresh',
      onClick: () => {
        formData.username = ''
        formData.email = ''
        addLog('表单已重置', 'warning')
      },
    },
    {
      key: 'submit',
      label: '提交',
      icon: 'mdi:check',
      type: 'primary',
      onClick: async () => {
        loading.value = true
        await new Promise(resolve => setTimeout(resolve, 1000))
        loading.value = false
        addLog('表单提交成功', 'success')
      },
    },
  ])

  // ================= 场景三：详情页头部 =================
  const detailLeftActions = computed<ActionItem[]>(() => [
    {
      key: 'back',
      label: '返回',
      icon: 'mdi:arrow-left',
      onClick: () => addLog('返回列表', 'default'),
    },
    {
      key: 'edit',
      label: '编辑',
      icon: 'mdi:pencil',
      type: 'primary',
      onClick: () => addLog('进入编辑模式', 'info'),
    },
  ])

  const detailRightActions = computed<ActionItem[]>(() => [
    {
      key: 'print',
      label: '打印',
      icon: 'mdi:printer',
      onClick: () => addLog('打印详情', 'info'),
    },
    {
      key: 'share',
      label: '分享',
      icon: 'mdi:share-variant',
      onClick: () => addLog('分享链接', 'info'),
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      onClick: () => addLog('删除记录', 'error'),
    },
  ])

  // ================= 场景四：步骤条导航 =================
  const stepActions = computed<ActionItem[]>(() => [
    {
      key: 'prev',
      label: '上一步',
      icon: 'mdi:arrow-left',
      disabled: currentStep.value === 0,
      onClick: () => {
        currentStep.value--
        addLog(`返回步骤 ${currentStep.value + 1}`, 'info')
      },
    },
    {
      key: 'skip',
      label: '跳过',
      icon: 'mdi:skip-next',
      show: currentStep.value < 2,
      onClick: () => {
        currentStep.value = 2
        addLog('跳过当前步骤', 'warning')
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
          addLog('步骤完成，重新开始', 'success')
        } else {
          currentStep.value++
          addLog(`进入步骤 ${currentStep.value + 1}`, 'info')
        }
      },
    },
  ])

  // ================= 场景五：响应式按钮 =================
  const reactiveActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      group: 'left',
      disabled: states.isEditing,
      tooltip: states.isEditing ? '编辑模式下不可新增' : '新增数据',
      onClick: () => addLog('新增', 'success'),
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete',
      type: 'error',
      group: 'left',
      disabled: computed(() => !states.hasSelection),
      show: computed(() => states.hasSelection),
      tooltip: '删除选中数据',
      onClick: () => addLog('删除', 'error'),
    },
    {
      key: 'edit',
      label: states.isEditing ? '保存' : '编辑',
      icon: states.isEditing ? 'mdi:check' : 'mdi:pencil',
      type: states.isEditing ? 'success' : 'warning',
      group: 'left',
      onClick: () => {
        states.isEditing = !states.isEditing
        addLog(states.isEditing ? '进入编辑模式' : '保存成功', 'warning')
      },
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      group: 'right',
      loading: computed(() => states.isRefreshing),
      onClick: async () => {
        states.isRefreshing = true
        addLog('开始刷新', 'info')
        await new Promise(resolve => setTimeout(resolve, 2000))
        states.isRefreshing = false
        addLog('刷新完成', 'success')
      },
    },
  ])

  // ================= 场景六：下拉菜单 =================
  const dropdownActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      group: 'left',
      onClick: () => addLog('新增', 'success'),
    },
    {
      key: 'more',
      label: '更多操作',
      icon: 'mdi:dots-horizontal',
      group: 'right',
      dropdown: [
        {
          key: 'export-excel',
          label: '导出Excel',
          icon: 'mdi:file-excel',
          onClick: () => addLog('导出Excel', 'success'),
        },
        {
          key: 'export-pdf',
          label: '导出PDF',
          icon: 'mdi:file-pdf',
          onClick: () => addLog('导出PDF', 'success'),
        },
        {
          key: 'print',
          label: '打印',
          icon: 'mdi:printer',
          onClick: () => addLog('打印', 'info'),
        },
      ],
    },
    {
      key: 'settings',
      label: '设置',
      icon: 'mdi:cog',
      group: 'right',
      dropdown: [
        {
          key: 'column',
          label: '列设置',
          icon: 'mdi:table-column',
          onClick: () => addLog('列设置', 'default'),
        },
        {
          key: 'filter',
          label: '筛选设置',
          icon: 'mdi:filter',
          onClick: () => addLog('筛选设置', 'default'),
        },
      ],
    },
  ])

  // ================= 场景七：配置选项用基础 actions =================
  const basicActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增',
      icon: 'mdi:plus-circle',
      type: 'primary',
      group: 'left',
      onClick: () => addLog('新增', 'success'),
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      type: 'info',
      group: 'right',
      onClick: handleRefresh,
    },
  ])

  // ================= 事件处理 =================
  const handleActionClick = (action: ActionItem) => {
    console.log('Action clicked:', action)
  }

  const handleDropdownClick = (
    item: ActionDropdownItem,
    action: ActionItem
  ) => {
    console.log('Dropdown item clicked:', item, action)
  }

  const handleRefresh = async () => {
    loading.value = true
    addLog('刷新数据', 'info')
    await new Promise(resolve => setTimeout(resolve, 1500))
    loading.value = false
    addLog('刷新完成', 'success')
    message.success('刷新成功')
  }

  const handleSelectionChange = (keys: Array<string | number>) => {
    selectedCount.value = keys.length
  }

  const addLog = (msg: string, type: string) => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    logs.value.unshift({ time, message: msg, type })
    if (logs.value.length > 20) {
      logs.value.pop()
    }
  }
</script>

<style scoped lang="scss">
  .action-bar-demo-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;

    :deep(.n-card) {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }
    }

    .log-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: var(--n-color-popover);
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--n-color-hover);
      }
    }
  }
</style>
