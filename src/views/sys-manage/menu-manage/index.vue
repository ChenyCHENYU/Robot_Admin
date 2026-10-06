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
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :disabled="saving"
        label-placement="top"
        class="menu-editor-form"
      >
        <NFormItem
          label="节点类型"
          path="type"
          ><NTag
            v-if="formData.type === 'button'"
            size="small"
            type="warning"
            >按钮权限</NTag
          ><NRadioGroup
            v-else
            v-model:value="formData.type"
            :disabled="modalMode === 'edit' || saving"
            ><NSpace
              ><NRadio value="directory">目录</NRadio
              ><NRadio value="menu">页面</NRadio></NSpace
            ></NRadioGroup
          ></NFormItem
        >
        <NFormItem
          :label="formData.type === 'button' ? '权限名称' : '菜单名称'"
          path="name"
          ><NInput
            v-model:value="formData.name"
            placeholder="请输入清晰易懂的名称"
            :maxlength="60"
            show-count
        /></NFormItem>
        <NFormItem
          :label="formData.type === 'button' ? '所属页面' : '上级目录'"
          path="parentId"
          ><NTreeSelect
            v-model:value="formData.parentId"
            :options="parentMenuOptions"
            :placeholder="
              formData.type === 'button' ? '选择所属页面' : '留空表示根目录'
            "
            :clearable="formData.type !== 'button'"
            filterable
            :disabled="
              saving || (formData.type === 'button' && modalMode === 'edit')
            "
        /></NFormItem>
        <NFormItem
          v-if="formData.type !== 'button'"
          label="路由路径"
          path="path"
          ><NInput
            v-model:value="formData.path"
            placeholder="如 /sys-manage/menu-manage"
        /></NFormItem>
        <NFormItem
          v-if="formData.type === 'menu'"
          label="页面组件"
          path="component"
          ><NInput
            v-model:value="formData.component"
            placeholder="如 /sys-manage/menu-manage/index"
        /></NFormItem>
        <NFormItem
          v-if="formData.type === 'button'"
          label="权限标识"
          path="permission"
          ><NInput
            v-model:value="formData.permission"
            placeholder="如 sys:menu:add"
        /></NFormItem>
        <NFormItem
          v-if="formData.type !== 'button'"
          label="菜单图标"
          path="icon"
          ><NInput
            v-model:value="formData.icon"
            placeholder="如 mdi:folder-outline"
            ><template #suffix
              ><C_Icon
                v-if="formData.icon"
                :name="formData.icon"
                :size="20" /></template></NInput
        ></NFormItem>
        <div
          v-if="formData.type !== 'button'"
          class="editor-settings"
        >
          <NFormItem
            label="排列顺序"
            path="sort"
            ><NInputNumber
              v-model:value="formData.sort"
              :min="0"
              :max="9999"
              :precision="0"
          /></NFormItem>
          <NFormItem
            label="菜单状态"
            path="status"
            ><NSwitch
              v-model:value="formData.status"
              :checked-value="1"
              :unchecked-value="0"
              ><template #checked>启用</template
              ><template #unchecked>禁用</template></NSwitch
            ></NFormItem
          >
          <NFormItem
            label="导航显示"
            path="hidden"
            ><NSwitch
              v-model:value="formData.hidden"
              :checked-value="0"
              :unchecked-value="1"
              ><template #checked>显示</template
              ><template #unchecked>隐藏</template></NSwitch
            ></NFormItem
          >
        </div>
        <NFormItem
          v-if="formData.type === 'menu'"
          label="页面缓存"
          path="keepAlive"
          ><div class="cache-editor"
            ><NSwitch
              v-model:value="formData.keepAlive"
              aria-label="页面缓存"
              ><template #checked>开启</template
              ><template #unchecked>关闭</template></NSwitch
            ><p
              >保留切换标签前的筛选、分页和表单状态。保存后同步导航生效；适合需要连续操作的页面。</p
            ></div
          ></NFormItem
        >
        <NFormItem
          label="备注"
          path="remark"
          ><NInput
            v-model:value="formData.remark"
            type="textarea"
            placeholder="用途或操作说明（选填）"
            :rows="2"
            :maxlength="500"
        /></NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
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
    formRules,
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
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
