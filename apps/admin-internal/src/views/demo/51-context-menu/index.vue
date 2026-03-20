<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\51-context-menu\index.vue
 * @Description: 右键菜单组件演示页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="ctx-menu-demo">
    <c_vTitle
      title="右键菜单组件场景示例"
      icon="mdi:menu"
      description="支持多级菜单、图标、分割线、危险操作样式等，适用于编辑器、文件管理、表格操作等场景"
    />

    <!-- ==================== 场景切换 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:television-play"
          class="title-icon"
        />
        在线演示
      </h2>
      <p class="section-desc"> 选择不同场景，在对应区域右键点击体验。 </p>

      <div class="scene-switcher">
        <div
          v-for="scene in DEMO_SCENES"
          :key="scene.key"
          class="scene-card"
          :class="{ 'is-active': activeScene === scene.key }"
          @click="activeScene = scene.key"
        >
          <C_Icon
            :name="scene.icon"
            class="scene-card__icon"
          />
          <span class="scene-card__title">{{ scene.title }}</span>
          <span class="scene-card__desc">{{ scene.description }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== 右键区域 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:cursor-default-click-outline"
          class="title-icon"
        />
        交互区域
      </h2>

      <!-- 编辑器场景 -->
      <div
        v-if="activeScene === 'editor'"
        class="ctx-area ctx-area--editor"
        @contextmenu.prevent="openMenu($event)"
      >
        <div class="ctx-area__hint">
          <C_Icon name="mdi:cursor-default-click-outline" />
          <span>在此区域 <b>右键点击</b> 打开编辑器菜单</span>
        </div>
        <pre class="ctx-area__code"><code>const greeting = 'Hello, Robot Admin!'
console.log(greeting)

// 右键体验编辑操作：撤销 / 复制 / 查找...</code></pre>
      </div>

      <!-- 文件管理场景 -->
      <div
        v-else-if="activeScene === 'file'"
        class="ctx-area ctx-area--file"
        @contextmenu.prevent="openMenu($event)"
      >
        <div class="ctx-area__hint">
          <C_Icon name="mdi:cursor-default-click-outline" />
          <span>在此区域 <b>右键点击</b> 打开文件管理菜单</span>
        </div>
        <div class="file-list">
          <div
            v-for="f in mockFiles"
            :key="f.name"
            class="file-item"
          >
            <C_Icon :name="f.icon" />
            <span>{{ f.name }}</span>
          </div>
        </div>
      </div>

      <!-- 表格场景 -->
      <div
        v-else
        class="ctx-area ctx-area--table"
        @contextmenu.prevent="openMenu($event)"
      >
        <div class="ctx-area__hint">
          <C_Icon name="mdi:cursor-default-click-outline" />
          <span>在表格行上 <b>右键点击</b> 打开操作菜单</span>
        </div>
        <NDataTable
          :columns="tableColumns"
          :data="tableData"
          :bordered="false"
          size="small"
          :pagination="false"
          :row-props="rowProps"
        />
      </div>
    </div>

    <!-- 右键菜单实例 -->
    <C_ContextMenu
      ref="menuRef"
      :items="currentMenuItems"
      @select="handleSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ContextMenuItem } from '@robot-admin/naive-ui-components'
  import {
    EDITOR_MENU,
    FILE_MANAGER_MENU,
    TABLE_ROW_MENU,
    DEMO_SCENES,
  } from './data'
  import './index.scss'

  const message = useMessage()

  // ===== 状态 =====
  const menuRef = ref()
  const activeScene = ref('editor')

  const MENU_MAP: Record<string, ContextMenuItem[]> = {
    editor: EDITOR_MENU,
    file: FILE_MANAGER_MENU,
    table: TABLE_ROW_MENU,
  }

  const currentMenuItems = computed(
    () => MENU_MAP[activeScene.value] ?? EDITOR_MENU
  )

  // ===== 打开菜单 =====
  const openMenu = (e: MouseEvent) => {
    menuRef.value?.open(e.clientX, e.clientY)
  }

  // ===== 模拟文件列表 =====
  const mockFiles = [
    { name: 'src/', icon: 'mdi:folder-outline' },
    { name: 'package.json', icon: 'mdi:nodejs' },
    { name: 'README.md', icon: 'mdi:language-markdown' },
    { name: 'vite.config.ts', icon: 'mdi:lightning-bolt' },
    { name: 'tsconfig.json', icon: 'mdi:language-typescript' },
  ]

  // ===== 模拟表格 =====
  const tableColumns = [
    { title: 'ID', key: 'id', width: 60 },
    { title: '名称', key: 'name' },
    { title: '状态', key: 'status' },
    { title: '更新时间', key: 'time' },
  ]

  const tableData = [
    { id: 1, name: 'Robot Admin', status: '运行中', time: '2026-03-05' },
    { id: 2, name: 'Component Lib', status: '构建中', time: '2026-03-04' },
    { id: 3, name: 'Theme Engine', status: '已暂停', time: '2026-03-03' },
  ]

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rowProps = (row: Record<string, unknown>) => ({
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      menuRef.value?.open(e.clientX, e.clientY)
    },
  })

  const handleSelect = (item: ContextMenuItem) => {
    message.info(`选中: ${item.label}`)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
