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
          :actions="page.toolbarActions"
          :config="{ compact: true, wrap: true }"
        />
      </div>
      <div class="workspace-summary">
        <span
          ><strong>{{ page.tree.stats.directories }}</strong> 目录</span
        >
        <span
          ><strong>{{ page.tree.stats.pages }}</strong> 页面</span
        >
        <span
          ><strong>{{ page.tree.stats.cached }}</strong> 已开启缓存</span
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
      v-if="page.navigation.pending"
      type="info"
      :show-icon="true"
      class="navigation-notice"
    >
      {{
        page.isMock ? '缓存设置已保存' : '配置已保存'
      }}，点击“同步导航”应用设置。同步会清空已打开页面的缓存状态。
    </NAlert>
    <div
      class="menu-workspace"
      :aria-busy="page.tree.loading || page.busy"
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
            :disabled="page.tree.loading"
            @click="page.tree.toggleExpansion"
            >{{ page.tree.expanded ? '收起全部' : '展开全部' }}</NButton
          >
        </template>
        <NInput
          v-model:value="page.tree.search"
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
          page.tree.search.trim()
            ? '搜索时暂不支持拖拽，清空后恢复'
            : '拖拽调整顺序；页面节点可移入目录'
        }}</p>
        <NSpin
          :show="page.tree.loading || page.mutating"
          :size="48"
          :rotate="false"
          class="tree-loading"
        >
          <template #icon><C_Loading /></template>
          <NResult
            v-if="page.tree.error"
            status="error"
            title="菜单加载失败"
            :description="page.tree.error"
          >
            <template #footer
              ><NButton @click="page.tree.load">重新加载</NButton></template
            >
          </NResult>
          <NEmpty
            v-else-if="!page.tree.loading && !page.tree.rows.length"
            :description="page.tree.search ? '没有匹配的菜单' : '暂无菜单'"
            class="panel-empty"
          >
            <template #extra
              ><NButton
                v-if="page.tree.search"
                size="small"
                @click="page.tree.search = ''"
                >清空搜索</NButton
              ><NButton
                v-else
                size="small"
                @click="page.editor.add()"
                >新增菜单</NButton
              ></template
            >
          </NEmpty>
          <C_Tree
            v-else
            ref="treeRef"
            mode="menu"
            :data="page.tree.rows"
            :searchable="false"
            :show-toolbar="false"
            :actions="page.tree.actions"
            :draggable="
              !page.busy && !page.tree.loading && !page.tree.search.trim()
            "
            :status-configs="page.menuStatusConfigs"
            :icon-config="page.tree.iconConfig"
            @node-select="page.tree.onSelect"
            @node-action="page.tree.onAction"
            @node-drop="page.tree.onDrop"
            class="menu-tree"
          />
        </NSpin>
      </NCard>

      <NCard
        class="details-panel"
        size="small"
      >
        <NEmpty
          v-if="!page.selection.menu"
          description="选择一个菜单，查看路由与页面配置"
          class="panel-empty"
        />
        <template v-else>
          <div class="detail-heading">
            <div class="detail-heading-text">
              <p class="menu-breadcrumb">{{
                page.selection.breadcrumbs.join(' / ')
              }}</p>
              <h2
                >{{ page.selection.menu.name }}
                <NTag
                  size="small"
                  :type="page.selection.getTypeColor(page.selection.menu.type)"
                  >{{
                    page.selection.getTypeText(page.selection.menu.type)
                  }}</NTag
                ></h2
              >
            </div>
            <NSpace :size="8">
              <NButton
                v-if="page.selection.menu.type === 'directory'"
                size="small"
                :disabled="page.busy"
                @click="page.editor.add(page.selection.menu.id)"
                >新增下级</NButton
              >
              <NButton
                size="small"
                :disabled="page.busy || page.tree.loading"
                @click="page.editor.edit(page.selection.menu)"
                >编辑菜单</NButton
              >
              <NButton
                size="small"
                quaternary
                type="error"
                :disabled="page.busy || page.tree.loading"
                @click="page.handleDeleteMenu(page.selection.menu)"
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
                  ><code>{{ page.selection.menu.id }}</code></dd
                ></div
              >
              <div
                ><dt>上级位置</dt
                ><dd>{{
                  page.selection.breadcrumbs.slice(0, -1).join(' / ') ||
                  '根目录'
                }}</dd></div
              >
              <div v-if="page.selection.menu.path"
                ><dt>访问路径</dt
                ><dd
                  ><code>{{ page.selection.path }}</code></dd
                ></div
              >
              <div v-if="page.selection.menu.component"
                ><dt>页面组件</dt
                ><dd
                  ><code>{{ page.selection.menu.component }}</code></dd
                ></div
              >
              <div
                ><dt>排列顺序</dt><dd>{{ page.selection.menu.sort }}</dd></div
              >
              <div
                ><dt>菜单状态</dt
                ><dd
                  ><NTag
                    size="small"
                    :type="
                      page.selection.menu.status === 1 ? 'success' : 'error'
                    "
                    :bordered="false"
                    >{{
                      page.selection.menu.status === 1 ? '启用' : '禁用'
                    }}</NTag
                  ></dd
                ></div
              >
              <div
                ><dt>导航可见</dt
                ><dd>{{
                  page.selection.menu.hidden === 1
                    ? '隐藏（仍可通过授权路径访问）'
                    : '显示在导航中'
                }}</dd></div
              >
            </dl>
          </section>
          <section
            v-if="page.selection.menu.type === 'menu'"
            class="detail-section"
          >
            <div class="section-heading"
              ><h3>页面行为</h3
              ><NTag
                :type="page.selection.menu.keepAlive ? 'success' : 'default'"
                size="small"
                :bordered="false"
                >{{
                  page.selection.menu.keepAlive
                    ? '缓存已开启'
                    : '每次进入重新加载'
                }}</NTag
              ></div
            >
            <div class="cache-description"
              ><C_Icon
                name="mdi:layers-outline"
                :size="24"
              /><div
                ><strong>{{
                  page.selection.menu.keepAlive
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
            v-if="page.selection.menu.type === 'menu'"
            class="detail-section permissions-section"
          >
            <div class="section-heading"
              ><h3
                >按钮权限
                <NText depth="3">{{ page.buttons.rows.length }}</NText></h3
              ><NButton
                size="small"
                type="primary"
                secondary
                :disabled="
                  page.busy || page.buttons.loading || !!page.buttons.error
                "
                @click="page.editor.addPermission"
                >添加权限</NButton
              ></div
            >
            <NSpin
              :show="page.buttons.loading"
              :size="48"
              :rotate="false"
            >
              <template #icon><C_Loading /></template>
              <NAlert
                v-if="page.buttons.error"
                type="error"
                title="权限加载失败"
                ><p>{{ page.buttons.error }}</p
                ><NButton
                  size="small"
                  @click="page.buttons.load"
                  >重试</NButton
                ></NAlert
              >
              <NEmpty
                v-else-if="!page.buttons.loading && !page.buttons.rows.length"
                description="尚未配置按钮权限，可添加新增、编辑或导出等操作权限"
                class="permission-empty"
              />
              <div
                v-else
                class="permission-list"
              >
                <div
                  v-for="permission in page.buttons.rows"
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
                    :actions="page.buttons.actions(permission)"
                    :config="{ compact: true, size: 'small' }"
                  />
                </div>
              </div>
            </NSpin>
          </section>
          <section
            v-if="page.selection.menu.type === 'directory'"
            class="detail-section"
          >
            <div class="section-heading"
              ><h3>直属下级</h3
              ><NText depth="3"
                >{{ page.selection.menu.children?.length || 0 }} 个节点</NText
              ></div
            >
            <div
              v-if="page.selection.menu.children?.length"
              class="child-list"
            >
              <NButton
                v-for="child in page.selection.menu.children"
                :key="child.id"
                text
                class="child-link"
                @click="page.tree.select(child.id)"
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
            v-if="page.selection.menu.remark"
            class="detail-section remark-section"
            ><h3>备注</h3><p>{{ page.selection.menu.remark }}</p></section
          >
          <p
            v-if="page.isMock"
            class="panel-hint source-hint"
            >演示模式：菜单维护用于演示交互，缓存开关按公司保存；实际权限以服务端授权为准。</p
          >
        </template>
      </NCard>
    </div>

    <NModal
      v-model:show="page.editor.visible"
      preset="dialog"
      :title="page.editor.title"
      :positive-text="page.editor.mode === 'add' ? '确认新增' : '保存配置'"
      negative-text="取消"
      :loading="page.editor.saving"
      :closable="!page.editor.saving"
      :mask-closable="!page.editor.saving"
      :close-on-esc="!page.editor.saving"
      :negative-button-props="{ disabled: page.editor.saving }"
      class="menu-editor"
      style="width: min(640px, calc(100vw - 32px))"
      @positive-click="page.editor.save"
      @negative-click="page.editor.cancel"
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
  import type { MenuFormData } from '@/api/menu-manage.contract'
  import { useMenuManagement } from './useMenuManagement'

  defineOptions({ name: 'MenuManagement' })

  const controller = useMenuManagement()
  const page = proxyRefs(controller)
  const { treeRef, formRef } = controller
  const formOptions = computed<FormOption<MenuFormData>[]>(() => [
    {
      prop: 'type',
      layout: { span: 3 },
      label: '节点类型',
      type: controller.editor.model.type === 'button' ? 'buttonType' : 'radio',
      children: [
        { label: '目录', value: 'directory' },
        { label: '页面', value: 'menu' },
      ],
      disabled: controller.editor.mode === 'edit' || controller.editor.saving,
      rulesWhen: model => controller.editor.rules('type', model),
    },
    {
      prop: 'name',
      layout: { span: 3 },
      label:
        controller.editor.model.type === 'button' ? '权限名称' : '菜单名称',
      type: 'input',
      placeholder: '请输入清晰易懂的名称',
      attrs: { maxlength: 60, showCount: true },
      rulesWhen: model => controller.editor.rules('name', model),
    },
    {
      prop: 'parentId',
      layout: { span: 3 },
      label:
        controller.editor.model.type === 'button' ? '所属页面' : '上级目录',
      type: 'treeSelect',
      attrs: {
        options: controller.editor.parentOptions,
        clearable: controller.editor.model.type !== 'button',
        filterable: true,
      },
      placeholder:
        controller.editor.model.type === 'button'
          ? '选择所属页面'
          : '留空表示根目录',
      disabled:
        controller.editor.saving ||
        (controller.editor.model.type === 'button' &&
          controller.editor.mode === 'edit'),
      rulesWhen: model => controller.editor.rules('parentId', model),
    },
    {
      prop: 'path',
      layout: { span: 3 },
      label: '路由路径',
      type: 'input',
      placeholder: '如 /sys-manage/menu-manage',
      show: controller.editor.model.type !== 'button',
      rulesWhen: model => controller.editor.rules('path', model),
    },
    {
      prop: 'component',
      layout: { span: 3 },
      label: '页面组件',
      type: 'input',
      placeholder: '如 /sys-manage/menu-manage/index',
      show: controller.editor.model.type === 'menu',
      rulesWhen: model => controller.editor.rules('component', model),
    },
    {
      prop: 'permission',
      layout: { span: 3 },
      label: '权限标识',
      type: 'input',
      placeholder: '如 sys:menu:add',
      show: controller.editor.model.type === 'button',
      rulesWhen: model => controller.editor.rules('permission', model),
    },
    {
      prop: 'icon',
      layout: { span: 3 },
      label: '菜单图标',
      type: 'menuIcon',
      placeholder: '如 mdi:folder-outline',
      show: controller.editor.model.type !== 'button',
    },
    {
      prop: 'sort',
      layout: { span: 1 },
      label: '排列顺序',
      type: 'inputNumber',
      attrs: { min: 0, max: 9999, precision: 0 },
      show: controller.editor.model.type !== 'button',
      rulesWhen: model => controller.editor.rules('sort', model),
    },
    {
      prop: 'status',
      layout: { span: 1 },
      label: '菜单状态',
      type: 'menuSwitch',
      attrs: { checkedValue: 1, uncheckedValue: 0 },
      show: controller.editor.model.type !== 'button',
    },
    {
      prop: 'hidden',
      layout: { span: 1 },
      label: '导航显示',
      type: 'menuSwitch',
      attrs: { checkedValue: 0, uncheckedValue: 1 },
      show: controller.editor.model.type !== 'button',
    },
    {
      prop: 'keepAlive',
      layout: { span: 3 },
      label: '页面缓存',
      type: 'menuSwitch',
      attrs: { 'aria-label': '页面缓存' },
      show: controller.editor.model.type === 'menu',
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
          controller.editor.model.icon
            ? h(C_Icon, { name: controller.editor.model.icon, size: 20 })
            : null,
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
