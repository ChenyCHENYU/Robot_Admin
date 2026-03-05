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
    <NH1>右键菜单组件场景示例</NH1>

    <!-- ==================== 功能特性 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:puzzle-outline"
          class="title-icon"
        />
        功能特性
      </h2>
      <div class="feature-grid">
        <div
          v-for="feat in FEATURE_LIST"
          :key="feat.title"
          class="feature-card"
        >
          <div class="feature-card__icon">
            <C_Icon :name="feat.icon" />
          </div>
          <div class="feature-card__body">
            <span class="feature-card__title">{{ feat.title }}</span>
            <span class="feature-card__desc">{{ feat.desc }}</span>
          </div>
          <NTag
            :bordered="false"
            size="small"
            :type="TAG_TYPE_MAP[feat.tag] ?? 'default'"
          >
            {{ feat.tag }}
          </NTag>
        </div>
      </div>
    </div>

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
      @open="handleOpen"
      @close="handleClose"
    />

    <!-- ==================== 事件日志 ==================== -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:console"
          class="title-icon"
        />
        事件日志
        <NButton
          quaternary
          size="small"
          style="margin-left: auto"
          @click="eventLogs = []"
        >
          清空
        </NButton>
      </h2>
      <div class="event-log-panel">
        <div
          v-for="(log, idx) in eventLogs.slice(-15)"
          :key="idx"
          class="event-log-item"
        >
          <span class="event-log-time">{{ log.time }}</span>
          <NTag
            :type="log.type"
            size="small"
            :bordered="false"
          >
            {{ log.event }}
          </NTag>
          <span
            v-if="log.detail"
            class="event-log-detail"
          >
            {{ log.detail }}
          </span>
        </div>
        <div
          v-if="!eventLogs.length"
          class="event-log-empty"
        >
          右键操作后事件将在此处实时显示...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ContextMenuItem } from '@/components/global/C_ContextMenu/types'
  import {
    EDITOR_MENU,
    FILE_MANAGER_MENU,
    TABLE_ROW_MENU,
    DEMO_SCENES,
    FEATURE_LIST,
    TAG_TYPE_MAP,
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

  const rowProps = (row: Record<string, unknown>) => ({
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      addLog('row-context', 'info', `行 #${row.id} — ${row.name}`)
      menuRef.value?.open(e.clientX, e.clientY)
    },
  })

  // ===== 事件日志 =====
  interface EventLog {
    time: string
    event: string
    type: 'default' | 'success' | 'info' | 'warning' | 'error'
    detail?: string
  }
  const eventLogs = ref<EventLog[]>([])

  /** 添加事件日志 */
  function addLog(
    event: string,
    type: EventLog['type'] = 'default',
    detail?: string
  ) {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    eventLogs.value.push({ time, event, type, detail })
  }

  const handleSelect = (item: ContextMenuItem) => {
    addLog(
      'select',
      item.danger ? 'error' : 'success',
      `${item.label} (${item.key})`
    )
    message.info(`选中: ${item.label}`)
  }

  const handleOpen = (pos: { x: number; y: number }) => {
    addLog('open', 'info', `(${pos.x}, ${pos.y})`)
  }

  const handleClose = () => {
    addLog('close', 'default')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
