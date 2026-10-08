<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\sys-manage\dictionary-manage\index.vue
 * @Description: 类型导航与字典项工作区，明确展示标签、存储值和编码
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="dictionary-management">
    <NCard
      class="dictionary-header"
      :bordered="false"
    >
      <div class="workspace-heading">
        <div class="workspace-title">
          <span class="workspace-emblem"
            ><C_Icon
              name="mdi:book-open-variant-outline"
              :size="24"
          /></span>
          <div
            ><h1>字典管理</h1><p>类型组织选项，标签用于展示，值用于存储</p></div
          >
        </div>
        <C_ActionBar
          class="workspace-actions"
          :actions="toolbarActions"
          :config="{ compact: true, wrap: true }"
        />
      </div>
      <div class="workspace-summary">
        <span
          ><strong>{{ stats.types }}</strong> 字典类型</span
        >
        <span
          ><strong>{{ stats.items }}</strong> 字典项</span
        >
        <NTag
          size="small"
          :bordered="false"
          :type="isMock ? 'warning' : 'success'"
          >{{ isMock ? '演示数据' : '已连接服务' }}</NTag
        >
      </div>
    </NCard>

    <NAlert
      v-if="loadError"
      type="error"
      title="字典加载失败"
    >
      {{ loadError }}
      <NButton
        size="small"
        :loading="loading"
        @click="loadDicts()"
        >重新加载</NButton
      >
    </NAlert>

    <div
      class="dictionary-workspace"
      :aria-busy="loading || busy"
    >
      <NCard
        class="dictionary-structure"
        title="字典目录"
        size="small"
      >
        <template #header-extra>
          <NButton
            quaternary
            size="tiny"
            :disabled="loading"
            @click="toggleExpansion"
            >{{ expanded ? '收起全部' : '展开全部' }}</NButton
          >
        </template>
        <NInput
          v-model:value="searchPattern"
          clearable
          placeholder="搜索名称、编码或存储值"
          :input-props="{ 'aria-label': '搜索字典' }"
        >
          <template #prefix
            ><C_Icon
              name="mdi:magnify"
              :size="16"
          /></template>
        </NInput>
        <p class="panel-hint">选择类型查看选项；展开可定位到具体字典项</p>
        <NSpin
          :show="loading || mutating"
          :size="48"
          :rotate="false"
          class="tree-loading"
        >
          <template #icon><C_Loading /></template>
          <NEmpty
            v-if="!loading && !filteredDictList.length"
            :description="searchPattern ? '没有匹配的字典' : '暂无字典类型'"
            class="panel-empty"
          >
            <template #extra>
              <NButton
                v-if="searchPattern"
                size="small"
                @click="searchPattern = ''"
                >清空搜索</NButton
              >
              <NButton
                v-else
                size="small"
                :disabled="!!loadError"
                @click="handleAdd()"
                >新增字典类型</NButton
              >
            </template>
          </NEmpty>
          <C_Tree
            v-else
            ref="treeRef"
            class="dictionary-tree"
            mode="custom"
            :data="filteredDictList"
            :searchable="false"
            :show-toolbar="false"
            :actions="treeActions"
            :status-configs="statusConfigs"
            :icon-config="iconConfig"
            @node-select="handleNodeSelect"
            @node-action="handleNodeAction"
          />
        </NSpin>
      </NCard>

      <NCard
        class="dictionary-details"
        size="small"
      >
        <NSpin
          :show="(loading || mutating) && !dictItems.length"
          :size="48"
          :rotate="false"
        >
          <template #icon><C_Loading /></template>
          <NEmpty
            v-if="!selectedType"
            description="新增或选择一个字典类型，开始维护选项"
            class="panel-empty"
          />
          <template v-else>
            <div class="detail-heading">
              <div class="type-title">
                <span class="eyebrow">字典类型</span>
                <h2
                  >{{ selectedType.name
                  }}<NTag
                    size="small"
                    :bordered="false"
                    :type="selectedType.status === 1 ? 'success' : 'default'"
                    >{{ selectedType.status === 1 ? '已启用' : '已停用' }}</NTag
                  ></h2
                >
                <code>{{ selectedType.code }}</code>
              </div>
              <NSpace
                :size="8"
                class="type-actions"
              >
                <NButton
                  size="small"
                  :disabled="actionsDisabled"
                  @click="handleEdit(selectedType)"
                  >编辑类型</NButton
                >
                <NButton
                  size="small"
                  :disabled="actionsDisabled"
                  @click="handleToggle(selectedType)"
                  >{{
                    selectedType.status === 1 ? '停用类型' : '启用类型'
                  }}</NButton
                >
                <NButton
                  size="small"
                  quaternary
                  type="error"
                  :disabled="actionsDisabled"
                  @click="handleDelete(selectedType)"
                  >删除类型</NButton
                >
              </NSpace>
            </div>
            <NAlert
              v-if="selectedType.status === 0"
              type="warning"
              :bordered="false"
              class="type-notice"
            >
              类型已停用，下级选项暂不生效。重新启用后，各字典项保留原有的启停状态。
            </NAlert>
            <p
              v-if="selectedType.remark"
              class="type-remark"
              >{{ selectedType.remark }}</p
            >

            <div class="items-heading">
              <div
                ><h3
                  >字典项
                  <span
                    >{{ dictItems.length }} 项 · {{ enabledItems }} 项生效</span
                  ></h3
                ><p>{{ itemExplanation }}</p></div
              >
              <NButton
                size="small"
                type="primary"
                :disabled="actionsDisabled || selectedType.status === 0"
                @click="handleAdd(selectedType)"
              >
                <template #icon
                  ><C_Icon
                    name="mdi:plus"
                    :size="16"
                    aria-hidden="true" /></template
                >新增字典项
              </NButton>
            </div>
            <C_Table
              v-if="dictItems.length"
              class="dictionary-items"
              :loading="loading || mutating"
              :columns="columns"
              :data="dictItems"
              :row-key="row => row.id"
              :row-props="rowProps"
              :config="{
                toolbar: { show: false },
                pagination:
                  dictItems.length > 10
                    ? {
                        pageSize: 10,
                        showSizePicker: false,
                        showQuickJumper: false,
                      }
                    : false,
                display: {
                  striped: false,
                  scrollX: 820,
                  maxHeight: 500,
                  size: 'small',
                  bordered: false,
                },
              }"
            />
            <NEmpty
              v-else
              class="items-empty"
              description="这个类型还没有字典项"
            >
              <template #extra
                ><NButton
                  size="small"
                  :disabled="actionsDisabled || selectedType.status === 0"
                  @click="handleAdd(selectedType)"
                  >添加第一个字典项</NButton
                ></template
              >
            </NEmpty>
            <p class="source-hint">{{
              isMock
                ? '当前为演示字典，修改在本次服务会话内生效。'
                : '字典数据由系统服务保存，业务通过类型编码和存储值读取选项。'
            }}</p>
          </template>
        </NSpin>
      </NCard>
    </div>

    <NModal
      :show="showModal"
      class="dictionary-editor"
      preset="card"
      :title="modalTitle"
      :closable="!saving"
      :mask-closable="!saving"
      :close-on-esc="!saving"
      style="width: min(600px, calc(100vw - 32px))"
      @update:show="handleCancel"
    >
      <C_Form
        v-if="showModal"
        ref="formRef"
        :model-value="formData"
        @update:model-value="Object.assign(formData, $event)"
        :options="formOptions"
        :config="formConfig"
        :renderers="formRenderers"
        @submit="showModal = false"
        class="dictionary-editor-form"
      />
      <div
        v-if="formData.type === 'item'"
        class="effective-preview"
      >
        <span>保存后生效预览</span>
        <NTag
          size="small"
          :bordered="false"
          :type="formItemState.effective ? 'success' : 'warning'"
          >{{
            formItemState.effective
              ? '可生效'
              : `不生效 · ${formItemState.reason}`
          }}</NTag
        >
      </div>
      <template #footer
        ><NSpace justify="end"
          ><NButton
            :disabled="saving"
            @click="handleCancel"
            >取消</NButton
          ><NButton
            type="primary"
            :loading="saving"
            @click="handleSave"
            >保存字典</NButton
          ></NSpace
        ></template
      >
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'

  import { C_Tree } from '@robot-admin/naive-ui-components/C_Tree'
  import '@robot-admin/naive-ui-components/C_Tree/style.css'
  import type {
    FormOption,
    FormRenderer,
  } from '@robot-admin/naive-ui-components/C_Form'
  import type { DictFormData, DictData } from '@/api/dictionary-manage.contract'
  import { getDictionaryState } from '@/api/d_dictionary'
  import { useDictionaryManagement } from './useDictionaryManagement'

  defineOptions({ name: 'DictionaryManage' })

  const {
    isMock,
    loading,
    busy,
    saving,
    mutating,
    loadError,
    searchPattern,
    selectedId,
    selectedType,
    dictItems,
    filteredDictList,
    stats,
    enabledItems,
    treeRef,
    formRef,
    formData,
    fieldRules,
    formConfig,
    parentOptions,
    formItemState,
    showModal,
    modalTitle,
    expanded,
    toolbarActions,
    treeActions,
    statusConfigs,
    iconConfig,
    loadDicts,
    selectDict,
    toggleExpansion,
    handleNodeSelect,
    handleNodeAction,
    handleAdd,
    handleEdit,
    handleCancel,
    handleSave,
    handleToggle,
    handleDelete,
  } = useDictionaryManagement()
  const actionsDisabled = computed(
    () => busy.value || loading.value || !!loadError.value
  )
  const itemExplanation = computed(() => {
    const item = dictItems.value[0]
    return item
      ? `界面显示“${item.dictLabel || item.name}”，业务保存“${item.dictValue ?? item.value ?? ''}”；编码为 ${item.code}。`
      : '显示标签便于理解，存储值用于业务提交。'
  })
  const rowProps = (row: DictData) => ({
    class: selectedId.value === row.id ? 'selected-dictionary-item' : '',
  })
  const codeCell = (value?: string) => h('code', null, value ?? '—')
  const renderItemStatus = (row: DictData) => {
    const state = getDictionaryState(row, selectedType.value)
    return h('div', { class: 'dictionary-item-status' }, [
      h(
        NTag,
        {
          size: 'small',
          bordered: false,
          type: state.enabled ? 'success' : 'default',
        },
        () => (state.enabled ? '已启用' : '已停用')
      ),
      state.enabled && !state.effective
        ? h(
            'span',
            { class: 'dictionary-status-note' },
            `${state.reason}，暂不生效`
          )
        : null,
    ])
  }
  const columns = computed<TableColumn<DictData>[]>(() => [
    {
      title: '显示标签',
      key: 'name',
      minWidth: 130,
      render: row =>
        h(
          NButton,
          { text: true, type: 'primary', onClick: () => selectDict(row.id) },
          () => row.dictLabel || row.name
        ),
    },
    {
      title: '存储值',
      key: 'value',
      width: 90,
      render: row => codeCell(row.dictValue ?? row.value),
    },
    {
      title: '字典项编码',
      key: 'code',
      minWidth: 140,
      render: row => codeCell(row.code),
    },
    { title: '排序', key: 'sort', width: 65 },
    {
      title: '字典项状态',
      key: 'status',
      width: 175,
      render: renderItemStatus,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: row =>
        h(NSpace, { size: 12, wrap: false, justify: 'center' }, () => [
          h(
            NButton,
            {
              text: true,
              size: 'small',
              disabled: actionsDisabled.value,
              onClick: () => handleEdit(row),
            },
            () => '编辑'
          ),
          h(
            NButton,
            {
              text: true,
              size: 'small',
              disabled: actionsDisabled.value,
              onClick: () => handleToggle(row),
            },
            () => (row.status === 1 ? '停用' : '启用')
          ),
          h(
            NButton,
            {
              text: true,
              size: 'small',
              type: 'error',
              disabled: actionsDisabled.value,
              onClick: () => handleDelete(row),
            },
            () => '删除'
          ),
        ]),
    },
  ])
  const formOptions = computed<FormOption<DictFormData>[]>(() => [
    {
      prop: 'name',
      layout: { span: 2 },
      label: formData.type === 'type' ? '类型名称' : '显示标签',
      type: 'input',
      placeholder:
        formData.type === 'type' ? '如 用户状态' : '用于界面展示，如 正常',
      attrs: { maxlength: 60 },
      rulesWhen: model => fieldRules('name', model),
    },
    {
      prop: 'typeCode',
      layout: { span: 2 },
      label: '类型编码',
      type: 'input',
      placeholder: '如 user_status',
      show: formData.type === 'type',
      help: '业务使用类型编码读取字典，请保持稳定且唯一。',
      rulesWhen: model => fieldRules('typeCode', model),
    },
    {
      prop: 'parentId',
      layout: { span: 2 },
      label: '所属类型',
      type: 'select',
      children: parentOptions.value,
      placeholder: '选择所属字典类型',
      show: formData.type === 'item',
      rulesWhen: model => fieldRules('parentId', model),
    },
    {
      prop: 'dictValue',
      layout: { span: 1 },
      label: '存储值',
      type: 'input',
      placeholder: '如 1、0 或 enabled',
      show: formData.type === 'item',
      help: '存储值用于业务提交，同一类型下不能重复；修改显示标签不会改写编码。',
      rulesWhen: model => fieldRules('dictValue', model),
    },
    {
      prop: 'code',
      layout: { span: 1 },
      label: '字典项编码（选填）',
      type: 'input',
      placeholder: '如 normal；留空使用存储值',
      show: formData.type === 'item',
      rulesWhen: model => fieldRules('code', model),
    },
    {
      prop: 'sort',
      layout: { span: 1 },
      label: '排序',
      type: 'inputNumber',
      attrs: { min: 0, max: 9999, precision: 0 },
      rulesWhen: model => fieldRules('sort', model),
    },
    {
      prop: 'status',
      layout: { span: 1 },
      label: formData.type === 'item' ? '字典项状态' : '类型状态',
      type: 'dictionaryStatus',
      attrs: { checkedValue: 1, uncheckedValue: 0 },
    },
    {
      prop: 'remark',
      layout: { span: 2 },
      label: '备注',
      type: 'textarea',
      placeholder: '说明此字典的用途（选填）',
      attrs: { autosize: { minRows: 2, maxRows: 4 } },
    },
  ])
  const formRenderers: Record<string, FormRenderer> = {
    dictionaryStatus: props =>
      h(NSwitch, props, { checked: () => '启用', unchecked: () => '停用' }),
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
