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
          :actions="page.toolbarActions"
          :config="{ compact: true, wrap: true }"
        />
      </div>
      <div class="workspace-summary">
        <span
          ><strong>{{ page.tree.stats.types }}</strong> 字典类型</span
        >
        <span
          ><strong>{{ page.tree.stats.items }}</strong> 字典项</span
        >
        <NTag
          size="small"
          :bordered="false"
          :type="page.isMock ? 'warning' : 'success'"
          >{{ page.isMock ? '演示数据' : '已连接服务' }}</NTag
        >
      </div>
    </NCard>

    <NAlert
      v-if="page.tree.error"
      type="error"
      title="字典加载失败"
    >
      {{ page.tree.error }}
      <NButton
        size="small"
        :loading="page.tree.loading"
        @click="page.tree.load()"
        >重新加载</NButton
      >
    </NAlert>

    <div
      class="dictionary-workspace"
      :aria-busy="page.tree.loading || page.busy"
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
            :disabled="page.tree.loading"
            @click="page.tree.toggleExpansion"
            >{{ page.tree.expanded ? '收起全部' : '展开全部' }}</NButton
          >
        </template>
        <NInput
          v-model:value="page.tree.search"
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
          :show="page.tree.loading || page.mutating"
          :size="48"
          :rotate="false"
          class="tree-loading"
        >
          <template #icon><C_Loading /></template>
          <NEmpty
            v-if="!page.tree.loading && !page.tree.rows.length"
            :description="page.tree.search ? '没有匹配的字典' : '暂无字典类型'"
            class="panel-empty"
          >
            <template #extra>
              <NButton
                v-if="page.tree.search"
                size="small"
                @click="page.tree.search = ''"
                >清空搜索</NButton
              >
              <NButton
                v-else
                size="small"
                :disabled="!!page.tree.error"
                @click="page.editor.add()"
                >新增字典类型</NButton
              >
            </template>
          </NEmpty>
          <C_Tree
            v-else
            ref="treeRef"
            class="dictionary-tree"
            mode="custom"
            :data="page.tree.rows"
            :selected-keys="
              page.selection.id === null ? [] : [page.selection.id]
            "
            :tree-props="{ cancelable: false }"
            :searchable="false"
            :show-toolbar="false"
            :actions="page.tree.actions"
            :status-configs="page.statusConfigs"
            :icon-config="page.iconConfig"
            @node-select="page.tree.onSelect"
            @node-action="page.tree.onAction"
          />
        </NSpin>
      </NCard>

      <NCard
        class="dictionary-details"
        size="small"
      >
        <NSpin
          :show="
            (page.tree.loading || page.mutating) && !page.selection.items.length
          "
          :size="48"
          :rotate="false"
        >
          <template #icon><C_Loading /></template>
          <NEmpty
            v-if="!page.selection.type"
            description="新增或选择一个字典类型，开始维护选项"
            class="panel-empty"
          />
          <template v-else>
            <div class="detail-heading">
              <div class="type-title">
                <span class="eyebrow">字典类型</span>
                <h2
                  >{{ page.selection.type.name
                  }}<NTag
                    size="small"
                    :bordered="false"
                    :type="
                      page.selection.type.status === 1 ? 'success' : 'default'
                    "
                    >{{
                      page.selection.type.status === 1 ? '已启用' : '已停用'
                    }}</NTag
                  ></h2
                >
                <code>{{ page.selection.type.code }}</code>
              </div>
              <NSpace
                :size="8"
                class="type-actions"
              >
                <NButton
                  size="small"
                  :disabled="actionsDisabled"
                  @click="page.editor.edit(page.selection.type)"
                  >编辑类型</NButton
                >
                <NButton
                  size="small"
                  :disabled="actionsDisabled"
                  @click="page.commands.toggle(page.selection.type)"
                  >{{
                    page.selection.type.status === 1 ? '停用类型' : '启用类型'
                  }}</NButton
                >
                <NButton
                  size="small"
                  quaternary
                  type="error"
                  :disabled="actionsDisabled"
                  @click="page.commands.remove(page.selection.type)"
                  >删除类型</NButton
                >
              </NSpace>
            </div>
            <NAlert
              v-if="page.selection.type.status === 0"
              type="warning"
              :bordered="false"
              class="type-notice"
            >
              类型已停用，下级选项暂不生效。重新启用后，各字典项保留原有的启停状态。
            </NAlert>
            <p
              v-if="page.selection.type.remark"
              class="type-remark"
              >{{ page.selection.type.remark }}</p
            >

            <div class="items-heading">
              <div
                ><h3
                  >字典项
                  <span
                    >{{ page.selection.items.length }} 项 ·
                    {{ page.selection.enabledCount }} 项生效</span
                  ></h3
                ><p>{{ itemExplanation }}</p></div
              >
              <NButton
                size="small"
                type="primary"
                :disabled="actionsDisabled || page.selection.type.status === 0"
                @click="page.editor.add(page.selection.type)"
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
              v-if="page.selection.items.length"
              class="dictionary-items"
              :loading="page.tree.loading || page.mutating"
              :columns="columns"
              :data="page.selection.items"
              :row-key="row => row.id"
              :row-props="rowProps"
              :config="{
                toolbar: { show: false },
                pagination:
                  page.selection.items.length > 10
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
                  :disabled="
                    actionsDisabled || page.selection.type.status === 0
                  "
                  @click="page.editor.add(page.selection.type)"
                  >添加第一个字典项</NButton
                ></template
              >
            </NEmpty>
            <p class="source-hint">{{
              page.isMock
                ? '当前为演示字典，修改在本次服务会话内生效。'
                : '字典数据由系统服务保存，业务通过类型编码和存储值读取选项。'
            }}</p>
          </template>
        </NSpin>
      </NCard>
    </div>

    <NModal
      :show="page.editor.visible"
      class="dictionary-editor"
      preset="card"
      :title="page.editor.title"
      :closable="!page.editor.saving"
      :mask-closable="!page.editor.saving"
      :close-on-esc="!page.editor.saving"
      style="width: min(600px, calc(100vw - 32px))"
      @update:show="page.editor.cancel"
    >
      <C_Form
        v-if="page.editor.visible"
        ref="formRef"
        :model-value="page.editor.model"
        @update:model-value="Object.assign(page.editor.model, $event)"
        :options="formOptions"
        :config="page.editor.config"
        :renderers="formRenderers"
        @submit="page.editor.visible = false"
        class="dictionary-editor-form"
      />
      <div
        v-if="page.editor.model.type === 'item'"
        class="effective-preview"
      >
        <span>保存后生效预览</span>
        <NTag
          size="small"
          :bordered="false"
          :type="page.editor.itemState.effective ? 'success' : 'warning'"
          >{{
            page.editor.itemState.effective
              ? '可生效'
              : `不生效 · ${page.editor.itemState.reason}`
          }}</NTag
        >
      </div>
      <template #footer
        ><NSpace justify="end"
          ><NButton
            :disabled="page.editor.saving"
            @click="page.editor.cancel"
            >取消</NButton
          ><NButton
            type="primary"
            :loading="page.editor.saving"
            @click="page.editor.save"
            >保存字典</NButton
          ></NSpace
        ></template
      >
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'

  import type {
    FormOption,
    FormRenderer,
  } from '@robot-admin/naive-ui-components/C_Form'
  import type { DictFormData, DictData } from '@/api/dictionary-manage.contract'
  import { getDictionaryState } from '@/api/d_dictionary'
  import { useDictionaryManagement } from './useDictionaryManagement'

  defineOptions({ name: 'DictionaryManage' })

  const controller = useDictionaryManagement()
  const page = proxyRefs(controller)
  const { treeRef, formRef } = controller
  const actionsDisabled = computed(
    () =>
      controller.busy.value ||
      controller.tree.loading ||
      !!controller.tree.error
  )
  const itemExplanation = computed(() => {
    const item = controller.selection.items[0]
    return item
      ? `界面显示“${item.dictLabel || item.name}”，业务保存“${item.dictValue ?? item.value ?? ''}”；编码为 ${item.code}。`
      : '显示标签便于理解，存储值用于业务提交。'
  })
  const rowProps = (row: DictData) => ({
    class: controller.selection.id === row.id ? 'selected-dictionary-item' : '',
  })
  const codeCell = (value?: string) => h('code', null, value ?? '—')
  const renderItemStatus = (row: DictData) => {
    const state = getDictionaryState(row, controller.selection.type)
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
          {
            text: true,
            type: 'primary',
            onClick: () => controller.tree.select(row.id),
          },
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
              onClick: () => controller.editor.edit(row),
            },
            () => '编辑'
          ),
          h(
            NButton,
            {
              text: true,
              size: 'small',
              disabled: actionsDisabled.value,
              onClick: () => controller.commands.toggle(row),
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
              onClick: () => controller.commands.remove(row),
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
      label: controller.editor.model.type === 'type' ? '类型名称' : '显示标签',
      type: 'input',
      placeholder:
        controller.editor.model.type === 'type'
          ? '如 用户状态'
          : '用于界面展示，如 正常',
      attrs: { maxlength: 60 },
      rulesWhen: model => controller.editor.rules('name', model),
    },
    {
      prop: 'typeCode',
      layout: { span: 2 },
      label: '类型编码',
      type: 'input',
      placeholder: '如 user_status',
      show: controller.editor.model.type === 'type',
      help: '业务使用类型编码读取字典，请保持稳定且唯一。',
      rulesWhen: model => controller.editor.rules('typeCode', model),
    },
    {
      prop: 'parentId',
      layout: { span: 2 },
      label: '所属类型',
      type: 'select',
      children: controller.editor.parentOptions,
      placeholder: '选择所属字典类型',
      show: controller.editor.model.type === 'item',
      rulesWhen: model => controller.editor.rules('parentId', model),
    },
    {
      prop: 'dictValue',
      layout: { span: 1 },
      label: '存储值',
      type: 'input',
      placeholder: '如 1、0 或 enabled',
      show: controller.editor.model.type === 'item',
      help: '存储值用于业务提交，同一类型下不能重复；修改显示标签不会改写编码。',
      rulesWhen: model => controller.editor.rules('dictValue', model),
    },
    {
      prop: 'code',
      layout: { span: 1 },
      label: '字典项编码（选填）',
      type: 'input',
      placeholder: '如 normal；留空使用存储值',
      show: controller.editor.model.type === 'item',
      rulesWhen: model => controller.editor.rules('code', model),
    },
    {
      prop: 'sort',
      layout: { span: 1 },
      label: '排序',
      type: 'inputNumber',
      attrs: { min: 0, max: 9999, precision: 0 },
      rulesWhen: model => controller.editor.rules('sort', model),
    },
    {
      prop: 'status',
      layout: { span: 1 },
      label:
        controller.editor.model.type === 'item' ? '字典项状态' : '类型状态',
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
