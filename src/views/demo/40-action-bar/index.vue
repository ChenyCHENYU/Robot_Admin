<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: 40-action-bar 页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

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
        <NText depth="3">本地员工记录 · 新增、删除和刷新</NText>
      </template>

      <div class="action-bar-demo-table-example">
        <C_ActionBar
          class="action-bar-demo-toolbar"
          :actions="table.actions"
          :config="{ size: 'tiny', wrap: true }"
        >
          <template #center>
            <NSpace
              v-if="table.selectionCount > 0"
              align="center"
            >
              <NText depth="3">已选择:</NText>
              <NTag
                type="primary"
                :bordered="false"
              >
                {{ table.selectionCount }} 条
              </NTag>
              <NButton
                text
                size="small"
                @click="table.clearSelection()"
              >
                清空
              </NButton>
            </NSpace>
          </template>
        </C_ActionBar>

        <C_Table
          ref="tableRef"
          wrapper-class="action-bar-demo-table"
          :data="table.rows"
          :columns="columns"
          :loading="table.loading"
          row-key="id"
          :config="{ selection: { enabled: true }, pagination: false }"
          @selection-change="table.updateSelection"
        />
      </div>
    </NCard>

    <NCard
      title="工具栏空间变化"
      class="mb-6"
    >
      <div
        class="action-bar-responsive"
        data-testid="action-overflow-demo"
      >
        <NCheckbox v-model:checked="narrowToolbar">模拟窄容器</NCheckbox>
        <div
          class="action-bar-responsive__frame"
          :class="{ 'is-narrow': narrowToolbar }"
        >
          <C_ActionBar
            :actions="overflowActions"
            :config="{ size: 'small', wrap: true, overflowAt: 480 }"
          />
        </div>
        <output
          class="hint-text"
          aria-live="polite"
        >
          {{ overflowResult || '缩窄后，导出和归档移到「更多」中。' }}
        </output>
      </div>
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
            <C_Form
              ref="formRef"
              v-model="form.model"
              :options="FORM_FIELDS"
              :config="form.config"
            />
            <C_ActionBar
              :actions="form.actions"
              :config="{ align: 'center' }"
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
              @action-click="announceAction"
              :config="{ showDivider: true }"
              class="mt-14"
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
            <C_ActionBar :actions="reactiveActions" />
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
              :actions="dropdownActions"
              @dropdown-click="announceDropdown"
              class="mt-4"
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
          <div class="action-bar-config">
            <div class="action-bar-config__controls">
              <div class="action-bar-config__row">
                <span class="config-label">对齐方式</span>
                <NRadioGroup
                  v-model:value="customConfig.align"
                  size="small"
                >
                  <NRadio value="left">左</NRadio>
                  <NRadio value="center">中</NRadio>
                  <NRadio value="right">右</NRadio>
                  <NRadio value="space-between">两端</NRadio>
                </NRadioGroup>
              </div>
              <div class="action-bar-config__row">
                <span class="config-label">按钮尺寸</span>
                <NSelect
                  v-model:value="customConfig.size"
                  aria-label="预览按钮尺寸"
                  size="small"
                  :options="ACTION_SIZE_OPTIONS"
                  class="action-bar-config__size"
                />
              </div>
              <div class="action-bar-config__row">
                <span class="config-label">分隔方向</span>
                <NRadioGroup
                  v-model:value="customConfig.dividerType"
                  :disabled="!customConfig.showDivider"
                  size="small"
                >
                  <NRadio value="vertical">竖线</NRadio>
                  <NRadio value="horizontal">短横线</NRadio>
                </NRadioGroup>
              </div>
              <div class="action-bar-config__row">
                <span class="config-label">布局选项</span>
                <NSpace :size="12">
                  <NCheckbox v-model:checked="customConfig.showDivider"
                    >分隔线</NCheckbox
                  >
                  <NCheckbox v-model:checked="customConfig.compact"
                    >紧凑</NCheckbox
                  >
                  <NCheckbox v-model:checked="customConfig.wrap"
                    >换行</NCheckbox
                  >
                  <NCheckbox v-model:checked="customConfig.inline"
                    >行内</NCheckbox
                  >
                </NSpace>
              </div>
            </div>
            <div class="action-bar-config__preview-header">
              <span>实时预览</span>
              <span>窄容器 · 最宽 360px</span>
            </div>
            <div class="action-bar-config__preview">
              <C_ActionBar
                :actions="layoutActions"
                @action-click="announceAction"
                :config="customConfig"
              />
            </div>
            <p class="action-bar-config__hint">
              紧凑会缩小留白和按钮间距；开启换行后，按钮随容器宽度自动折行。
            </p>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import {
    defineActions,
    resolveActionPreset,
    type ActionItem,
    type ActionDropdownItem,
  } from '@robot-admin/naive-ui-components/C_ActionBar'
  import { delayWithSignal, isAbortError } from '@/utils/abort'
  import {
    columns,
    DEFAULT_CUSTOM_CONFIG,
    ACTION_SIZE_OPTIONS,
    MORE_DROPDOWN_ITEMS,
    SETTINGS_DROPDOWN_ITEMS,
  } from './data'
  import {
    FORM_FIELDS,
    useActionFormDemo,
    useActionTableDemo,
  } from './useActionBarDemos'

  defineOptions({ name: 'Demo40ActionBar' })

  const message = useMessage()
  const { tableRef, table } = useActionTableDemo()
  const { formRef, form } = useActionFormDemo()
  const customConfig = reactive({ ...DEFAULT_CUSTOM_CONFIG })
  const currentStep = ref(0)
  const states = reactive({ hasSelection: false, isEditing: false })
  const narrowToolbar = ref(false)
  const overflowResult = ref('')
  let exportCount = 0
  const scope = new AbortController()
  onScopeDispose(() => scope.abort())

  /** 只在演示页仍打开时完成本地计时任务。 */
  const waitForDemo = async (duration: number) => {
    try {
      await delayWithSignal(duration, scope.signal)
      return !scope.signal.aborted
    } catch (error) {
      if (isAbortError(error)) return false
      throw error
    }
  }

  const announceAction = (action: ActionItem) => {
    message.info(`动作演示：${resolveActionPreset(action).label}`)
  }
  const announceDropdown = (item: ActionDropdownItem) => {
    message.info(`菜单演示：${item.label}`)
  }

  const detailActions = defineActions([
    { key: 'back', label: '返回', icon: 'mdi:arrow-left' },
    { key: 'edit', type: 'primary' },
    { key: 'print' },
    { key: 'share', label: '分享', icon: 'mdi:share-variant' },
    { key: 'delete' },
  ])
  const layoutActions = defineActions([
    { key: 'add' },
    { key: 'refresh', type: 'info' },
    { key: 'edit' },
    { key: 'import' },
    { key: 'export' },
    { key: 'settings' },
  ])
  const dropdownActions = defineActions([
    { key: 'add', onClick: () => message.info('动作演示：新增') },
    { key: 'more', dropdown: MORE_DROPDOWN_ITEMS },
    { key: 'settings', label: '设置', dropdown: SETTINGS_DROPDOWN_ITEMS },
  ])
  const stepActions = computed(() => {
    const lastStep = currentStep.value === 2
    return defineActions([
      {
        key: 'prev',
        label: '上一步',
        icon: 'mdi:arrow-left',
        disabled: currentStep.value === 0,
        onClick: () => {
          currentStep.value--
        },
      },
      {
        key: 'skip',
        label: '跳过',
        icon: 'mdi:skip-next',
        show: !lastStep,
        onClick: () => {
          currentStep.value = 2
        },
      },
      {
        key: 'next',
        label: lastStep ? '完成' : '下一步',
        icon: lastStep ? 'mdi:check' : 'mdi:arrow-right',
        type: 'primary',
        onClick: () => {
          if (lastStep) {
            currentStep.value = 0
            message.success('步骤演示完成')
          } else currentStep.value++
        },
      },
    ])
  })
  const reactiveActions = computed(() =>
    defineActions([
      {
        key: 'add',
        disabled: states.isEditing,
        onClick: () => message.info('状态演示：新增'),
      },
      {
        key: 'delete',
        show: states.hasSelection,
        onClick: () => {
          states.hasSelection = false
          message.info('已清除演示选择')
        },
      },
      {
        key: 'edit',
        label: states.isEditing ? '保存' : '编辑',
        icon: states.isEditing ? 'mdi:check' : 'mdi:pencil',
        type: states.isEditing ? 'success' : 'warning',
        onClick: () => {
          states.isEditing = !states.isEditing
        },
      },
      {
        key: 'refresh',
        type: 'info',
        onClick: async () => {
          if (await waitForDemo(2000)) message.info('刷新完成')
        },
      },
    ])
  )
  const overflowActions = defineActions([
    {
      key: 'new-ticket',
      label: '新增工单',
      type: 'primary',
      icon: 'mdi:plus',
      onClick: () => {
        overflowResult.value = '已触发新增工单演示'
      },
    },
    {
      key: 'export-summary',
      label: '导出汇总',
      icon: 'mdi:download',
      overflow: true,
      onClick: async () => {
        overflowResult.value = '正在模拟生成汇总…'
        if (await waitForDemo(600)) {
          overflowResult.value = `已完成 ${++exportCount} 次模拟导出`
        }
      },
    },
    {
      key: 'archive-ticket',
      label: '归档工单',
      icon: 'mdi:archive-outline',
      overflow: true,
      disabled: true,
    },
  ])
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
