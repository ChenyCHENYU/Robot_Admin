<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\index.vue
 * @Description: 菜单结构、路由行为与按钮权限工作区
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="menu-management">
    <NCard
      class="workspace-header"
      :bordered="false"
    >
      <div class="workspace-heading">
        <div class="workspace-title">
          <span class="workspace-emblem"
            ><C_Icon
              name="mdi:file-tree-outline"
              :size="24"
          /></span>
          <div
            ><h1>菜单管理</h1><p>组织导航结构，配置页面行为与按钮权限</p></div
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
          ><strong>{{ stats.directories }}</strong> 目录</span
        >
        <span
          ><strong>{{ stats.pages }}</strong> 页面</span
        >
        <span
          ><strong>{{ stats.cached }}</strong> 已开启缓存</span
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
      v-if="navigationDirty"
      type="info"
      :show-icon="true"
      class="navigation-notice"
    >
      {{
        isMock ? '缓存设置已保存' : '配置已保存'
      }}，点击“同步导航”应用设置。同步会清空已打开页面的缓存状态。
    </NAlert>
    <div
      class="menu-workspace"
      :aria-busy="loading || busy"
    >
      <NCard
        class="structure-panel"
        size="small"
        title="菜单结构"
      >
        <template #header-extra>
          <NButton
            size="tiny"
            quaternary
            :disabled="loading"
            @click="toggleExpansion"
            >{{ expanded ? '收起全部' : '展开全部' }}</NButton
          >
        </template>
        <NInput
          v-model:value="searchPattern"
          placeholder="搜索名称、路径或权限"
          clearable
          :input-props="{ 'aria-label': '搜索菜单' }"
          class="tree-search"
        >
          <template #prefix
            ><C_Icon
              name="mdi:magnify"
              :size="16"
          /></template>
        </NInput>
        <p class="panel-hint">{{
          searchPattern.trim()
            ? '搜索时暂不支持拖拽，清空后恢复'
            : '拖拽调整顺序；页面节点可移入目录'
        }}</p>
        <NSpin
          :show="loading || mutating"
          :size="48"
          :rotate="false"
          class="tree-loading"
        >
          <template #icon><C_Loading /></template>
          <NResult
            v-if="loadError"
            status="error"
            title="菜单加载失败"
            :description="loadError"
          >
            <template #footer
              ><NButton @click="loadMenus">重新加载</NButton></template
            >
          </NResult>
          <NEmpty
            v-else-if="!loading && !filteredMenuList.length"
            :description="searchPattern ? '没有匹配的菜单' : '暂无菜单'"
            class="panel-empty"
          >
            <template #extra
              ><NButton
                v-if="searchPattern"
                size="small"
                @click="searchPattern = ''"
                >清空搜索</NButton
              ><NButton
                v-else
                size="small"
                @click="handleAddMenu()"
                >新增菜单</NButton
              ></template
            >
          </NEmpty>
          <C_Tree
            v-else
            ref="treeRef"
            mode="menu"
            :data="filteredMenuList"
            :searchable="false"
            :show-toolbar="false"
            :actions="treeActions"
            :draggable="!busy && !loading && !searchPattern.trim()"
            :status-configs="menuStatusConfigs"
            :icon-config="menuIconConfig"
            @node-select="handleNodeSelect"
            @node-action="handleNodeAction"
            @node-drop="handleNodeDrop"
            class="menu-tree"
          />
        </NSpin>
      </NCard>

      <NCard
        class="details-panel"
        size="small"
      >
        <NEmpty
          v-if="!selectedMenu"
          description="选择一个菜单，查看路由与页面配置"
          class="panel-empty"
        />
        <template v-else>
          <div class="detail-heading">
            <div class="detail-heading-text">
              <p class="menu-breadcrumb">{{ breadcrumbs.join(' / ') }}</p>
              <h2
                >{{ selectedMenu.name }}
                <NTag
                  size="small"
                  :type="getMenuTypeColor(selectedMenu.type)"
                  >{{ getMenuTypeText(selectedMenu.type) }}</NTag
                ></h2
              >
            </div>
            <NSpace :size="8">
              <NButton
                v-if="selectedMenu.type === 'directory'"
                size="small"
                :disabled="busy"
                @click="handleAddMenu(selectedMenu.id)"
                >新增下级</NButton
              >
              <NButton
                size="small"
                :disabled="busy || loading"
                @click="handleEditMenu(selectedMenu)"
                >编辑菜单</NButton
              >
              <NButton
                size="small"
                quaternary
                type="error"
                :disabled="busy || loading"
                @click="handleDeleteMenu(selectedMenu)"
                >删除</NButton
              >
            </NSpace>
          </div>
          <section class="detail-section">
            <h3>路由信息</h3>
            <dl class="menu-facts">
              <div
                ><dt>路由标识</dt
                ><dd
                  ><code>{{ selectedMenu.id }}</code></dd
                ></div
              >
              <div
                ><dt>上级位置</dt
                ><dd>{{
                  breadcrumbs.slice(0, -1).join(' / ') || '根目录'
                }}</dd></div
              >
              <div v-if="selectedMenu.path"
                ><dt>访问路径</dt
                ><dd
                  ><code>{{ selectedPath }}</code></dd
                ></div
              >
              <div v-if="selectedMenu.component"
                ><dt>页面组件</dt
                ><dd
                  ><code>{{ selectedMenu.component }}</code></dd
                ></div
              >
              <div
                ><dt>排列顺序</dt><dd>{{ selectedMenu.sort }}</dd></div
              >
              <div
                ><dt>菜单状态</dt
                ><dd
                  ><NTag
                    size="small"
                    :type="selectedMenu.status === 1 ? 'success' : 'error'"
                    :bordered="false"
                    >{{ selectedMenu.status === 1 ? '启用' : '禁用' }}</NTag
                  ></dd
                ></div
              >
              <div
                ><dt>导航可见</dt
                ><dd>{{
                  selectedMenu.hidden === 1
                    ? '隐藏（仍可通过授权路径访问）'
                    : '显示在导航中'
                }}</dd></div
              >
            </dl>
          </section>
          <section
            v-if="selectedMenu.type === 'menu'"
            class="detail-section"
          >
            <div class="section-heading"
              ><h3>页面行为</h3
              ><NTag
                :type="selectedMenu.keepAlive ? 'success' : 'default'"
                size="small"
                :bordered="false"
                >{{
                  selectedMenu.keepAlive ? '缓存已开启' : '每次进入重新加载'
                }}</NTag
              ></div
            >
            <div class="cache-description"
              ><C_Icon
                name="mdi:layers-outline"
                :size="24"
              /><div
                ><strong>{{
                  selectedMenu.keepAlive
                    ? '切换标签后继续上次操作'
                    : '进入页面时获取最新状态'
                }}</strong
                ><p
                  >开启后保留筛选、分页和未提交内容。刷新浏览器、退出登录或切换公司后重新加载。</p
                ></div
              ></div
            >
          </section>
          <section
            v-if="selectedMenu.type === 'menu'"
            class="detail-section permissions-section"
          >
            <div class="section-heading"
              ><h3
                >按钮权限
                <NText depth="3">{{ buttonPermissions.length }}</NText></h3
              ><NButton
                size="small"
                type="primary"
                secondary
                :disabled="busy || permissionsLoading || !!permissionsError"
                @click="handleAddPermission"
                >添加权限</NButton
              ></div
            >
            <NSpin
              :show="permissionsLoading"
              :size="48"
              :rotate="false"
            >
              <template #icon><C_Loading /></template>
              <NAlert
                v-if="permissionsError"
                type="error"
                title="权限加载失败"
                ><p>{{ permissionsError }}</p
                ><NButton
                  size="small"
                  @click="loadPermissions"
                  >重试</NButton
                ></NAlert
              >
              <NEmpty
                v-else-if="!permissionsLoading && !buttonPermissions.length"
                description="尚未配置按钮权限，可添加新增、编辑或导出等操作权限"
                class="permission-empty"
              />
              <div
                v-else
                class="permission-list"
              >
                <div
                  v-for="permission in buttonPermissions"
                  :key="permission.id"
                  class="permission-row"
                >
                  <C_Icon
                    name="mdi:shield-key-outline"
                    :size="20"
                  />
                  <div class="permission-copy"
                    ><strong>{{ permission.name }}</strong
                    ><code>{{ permission.permission }}</code
                    ><p v-if="permission.remark">{{
                      permission.remark
                    }}</p></div
                  >
                  <C_ActionBar
                    :actions="getPermissionActions(permission)"
                    :config="{ compact: true, size: 'small' }"
                  />
                </div>
              </div>
            </NSpin>
          </section>
          <section
            v-if="selectedMenu.type === 'directory'"
            class="detail-section"
          >
            <div class="section-heading"
              ><h3>直属下级</h3
              ><NText depth="3"
                >{{ selectedMenu.children?.length || 0 }} 个节点</NText
              ></div
            >
            <div
              v-if="selectedMenu.children?.length"
              class="child-list"
            >
              <NButton
                v-for="child in selectedMenu.children"
                :key="child.id"
                text
                class="child-link"
                @click="selectMenu(child.id)"
                ><C_Icon
                  :name="
                    child.type === 'directory'
                      ? 'mdi:folder-outline'
                      : 'mdi:file-document-outline'
                  "
                  :size="18" /><span>{{ child.name }}</span
                ><C_Icon
                  name="mdi:chevron-right"
                  :size="16"
              /></NButton>
            </div>
            <NEmpty
              v-else
              description="目录为空，点击新增下级添加页面"
              class="permission-empty"
            />
          </section>
          <section
            v-if="selectedMenu.remark"
            class="detail-section remark-section"
            ><h3>备注</h3><p>{{ selectedMenu.remark }}</p></section
          >
          <p
            v-if="isMock"
            class="panel-hint source-hint"
            >演示模式：菜单维护用于演示交互，缓存开关按公司保存；实际权限以服务端授权为准。</p
          >
        </template>
      </NCard>
    </div>

    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认新增' : '保存配置'"
      negative-text="取消"
      :loading="saving"
      :closable="!saving"
      :mask-closable="!saving"
      :close-on-esc="!saving"
      :negative-button-props="{ disabled: saving }"
      class="menu-editor"
      style="width: min(640px, calc(100vw - 32px))"
      @positive-click="handleSaveMenu"
      @negative-click="handleCancelModal"
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
        class="menu-editor-form"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { NTreeSelect } from 'naive-ui/es'
  import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'
  import type {
    FormOption,
    FormRenderer,
  } from '@robot-admin/naive-ui-components/C_Form'
  import type { FormData } from './data'
  import { C_Tree } from '@robot-admin/naive-ui-components/C_Tree'
  import '@robot-admin/naive-ui-components/C_Tree/style.css'
  import { useMenuManagement } from './useMenuManagement'

  defineOptions({ name: 'MenuManagement' })

  const {
    loading,
    loadError,
    permissionsLoading,
    permissionsError,
    saving,
    mutating,
    busy,
    navigationDirty,
    searchPattern,
    showModal,
    modalMode,
    modalTitle,
    formRef,
    treeRef,
    formData,
    fieldRules,
    formConfig,
    selectedMenu,
    filteredMenuList,
    parentMenuOptions,
    buttonPermissions,
    breadcrumbs,
    selectedPath,
    stats,
    treeActions,
    menuIconConfig,
    menuStatusConfigs,
    toolbarActions,
    expanded,
    isMock,
    getMenuTypeText,
    getMenuTypeColor,
    getPermissionActions,
    selectMenu,
    handleNodeSelect,
    handleNodeAction,
    handleNodeDrop,
    toggleExpansion,
    handleAddMenu,
    handleAddPermission,
    handleEditMenu,
    handleDeleteMenu,
    handleSaveMenu,
    handleCancelModal,
    loadMenus,
    loadPermissions,
  } = useMenuManagement()
  const formOptions = computed<FormOption<FormData>[]>(() => [
    {
      prop: 'type',
      layout: { span: 3 },
      label: '节点类型',
      type: formData.type === 'button' ? 'buttonType' : 'radio',
      children: [
        { label: '目录', value: 'directory' },
        { label: '页面', value: 'menu' },
      ],
      disabled: modalMode.value === 'edit' || saving.value,
      rulesWhen: model => fieldRules('type', model),
    },
    {
      prop: 'name',
      layout: { span: 3 },
      label: formData.type === 'button' ? '权限名称' : '菜单名称',
      type: 'input',
      placeholder: '请输入清晰易懂的名称',
      attrs: { maxlength: 60, showCount: true },
      rulesWhen: model => fieldRules('name', model),
    },
    {
      prop: 'parentId',
      layout: { span: 3 },
      label: formData.type === 'button' ? '所属页面' : '上级目录',
      type: 'treeSelect',
      attrs: {
        options: parentMenuOptions.value,
        clearable: formData.type !== 'button',
        filterable: true,
      },
      placeholder:
        formData.type === 'button' ? '选择所属页面' : '留空表示根目录',
      disabled:
        saving.value ||
        (formData.type === 'button' && modalMode.value === 'edit'),
      rulesWhen: model => fieldRules('parentId', model),
    },
    {
      prop: 'path',
      layout: { span: 3 },
      label: '路由路径',
      type: 'input',
      placeholder: '如 /sys-manage/menu-manage',
      show: formData.type !== 'button',
      rulesWhen: model => fieldRules('path', model),
    },
    {
      prop: 'component',
      layout: { span: 3 },
      label: '页面组件',
      type: 'input',
      placeholder: '如 /sys-manage/menu-manage/index',
      show: formData.type === 'menu',
      rulesWhen: model => fieldRules('component', model),
    },
    {
      prop: 'permission',
      layout: { span: 3 },
      label: '权限标识',
      type: 'input',
      placeholder: '如 sys:menu:add',
      show: formData.type === 'button',
      rulesWhen: model => fieldRules('permission', model),
    },
    {
      prop: 'icon',
      layout: { span: 3 },
      label: '菜单图标',
      type: 'menuIcon',
      placeholder: '如 mdi:folder-outline',
      show: formData.type !== 'button',
    },
    {
      prop: 'sort',
      layout: { span: 1 },
      label: '排列顺序',
      type: 'inputNumber',
      attrs: { min: 0, max: 9999, precision: 0 },
      show: formData.type !== 'button',
      rulesWhen: model => fieldRules('sort', model),
    },
    {
      prop: 'status',
      layout: { span: 1 },
      label: '菜单状态',
      type: 'menuSwitch',
      attrs: { checkedValue: 1, uncheckedValue: 0 },
      show: formData.type !== 'button',
    },
    {
      prop: 'hidden',
      layout: { span: 1 },
      label: '导航显示',
      type: 'menuSwitch',
      attrs: { checkedValue: 0, uncheckedValue: 1 },
      show: formData.type !== 'button',
    },
    {
      prop: 'keepAlive',
      layout: { span: 3 },
      label: '页面缓存',
      type: 'menuSwitch',
      attrs: { 'aria-label': '页面缓存' },
      show: formData.type === 'menu',
      help: '保留切换标签前的筛选、分页和表单状态。保存后同步导航生效；适合需要连续操作的页面。',
    },
    {
      prop: 'remark',
      layout: { span: 3 },
      label: '备注',
      type: 'textarea',
      placeholder: '用途或操作说明（选填）',
      attrs: { rows: 2, maxlength: 500 },
    },
  ])
  const formRenderers: Record<string, FormRenderer> = {
    treeSelect: props => h(NTreeSelect, props),
    buttonType: () =>
      h(NTag, { size: 'small', type: 'warning' }, () => '按钮权限'),
    menuIcon: props =>
      h(NInput, props, {
        suffix: () =>
          formData.icon ? h(C_Icon, { name: formData.icon, size: 20 }) : null,
      }),
    menuSwitch: (props, item) =>
      h(NSwitch, props, {
        checked: () =>
          ({ status: '启用', hidden: '显示', keepAlive: '开启' })[item.prop],
        unchecked: () =>
          ({ status: '禁用', hidden: '隐藏', keepAlive: '关闭' })[item.prop],
      }),
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
