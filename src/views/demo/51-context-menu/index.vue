<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\51-context-menu\index.vue
 * @Description: 项目资源工作台中的右键菜单、键盘菜单与可撤销操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="resource-workspace">
    <header class="resource-heading"
      ><div
        ><span>RESOURCE WORKSPACE / C_CONTEXTMENU</span
        ><h1>操作，出现在需要它的地方</h1
        ><p>右键资源、使用操作按钮，或按 Shift + F10 打开菜单。</p></div
      ><NButton
        :disabled="!removed"
        @click="undo"
        >撤销移除</NButton
      ></header
    >
    <div class="resource-window">
      <header class="resource-toolbar"
        ><span class="resource-breadcrumb"
          ><span class="i-mdi:folder-outline" />Robot Admin
          <span>/</span> 示例资源</span
        ><NInput
          v-model:value="query"
          placeholder="搜索资源名称"
          size="small"
          clearable
          aria-label="搜索资源名称"
      /></header>
      <div class="resource-layout">
        <aside class="resource-navigation"
          ><span class="eyebrow">EXPLORER</span
          ><div class="resource-tree"
            ><span class="i-mdi:chevron-down" /><span
              class="i-mdi:folder-open-outline"
            />示例资源<small>{{ files.length }}</small></div
          ><p>从实际项目依赖和组件配置生成的演示副本。</p
          ><div class="resource-help"
            ><span class="i-mdi:cursor-default-click-outline" /><strong
              >按上下文操作</strong
            ><p>先选中一个资源，再尝试查看、复制、下载或移除。</p></div
          ><div class="resource-local"
            ><span
              class="i-mdi:shield-check-outline"
            />副本操作，仅当前页面生效</div
          ></aside
        >
        <section
          class="resource-files"
          aria-label="资源列表"
          ><div class="resource-list-heading"
            ><span>名称</span><span>大小</span></div
          ><div
            v-for="file in filteredFiles"
            :key="file.id"
            class="resource-row"
            :class="{ selected: selectedId === file.id }"
            tabindex="0"
            role="button"
            :aria-pressed="selectedId === file.id"
            @click="selectedId = file.id"
            @keydown.enter="selectedId = file.id"
            @keydown.space.prevent="selectedId = file.id"
            @keydown.shift.f10.prevent="openKeyboardMenu($event, file)"
            @contextmenu.prevent="openPointerMenu($event, file)"
            ><C_Icon
              :name="file.icon"
              :size="25" /><div
              ><strong>{{ file.name }}</strong
              ><small>{{ file.type }}</small></div
            ><span>{{ fileSize(file.content) }}</span
            ><button
              type="button"
              :aria-label="`操作 ${file.name}`"
              @click.stop="openPointerMenu($event, file)"
              ><span class="i-mdi:dots-horizontal" /></button></div
          ><div
            v-if="!filteredFiles.length"
            class="resource-empty"
            ><span class="i-mdi:file-search-outline" /><p>没有匹配的资源</p
            ><NButton
              v-if="query"
              text
              @click="query = ''"
              >清除搜索</NButton
            ></div
          ><footer
            ><span>{{ filteredFiles.length }} 个资源</span
            ><span>支持子菜单 · 禁用项 · 可撤销操作</span></footer
          ></section
        >
        <aside class="resource-preview"
          ><header
            ><span class="eyebrow">CONTENT PREVIEW</span
            ><span>{{ selectedFile?.type || '—' }}</span></header
          ><h2>{{ selectedFile?.name || '选择一个资源' }}</h2
          >><pre
            v-if="selectedFile"
            tabindex="0"
            aria-label="资源内容预览"
          ><code>{{ selectedFile.content }}</code></pre
          ><p v-else>从列表选择资源，查看它的内容。</p
          ><div class="resource-activity"
            ><span class="eyebrow">操作记录</span
            ><p v-if="!activities.length">还没有执行操作</p
            ><p
              v-for="(activity, index) in activities.slice(-3).reverse()"
              :key="index"
              ><span class="i-mdi:check-circle-outline" />{{ activity }}</p
            ></div
          ></aside
        >
      </div>
    </div>
    <C_ContextMenu
      ref="menu"
      :items="FILE_MENU"
      :min-width="205"
      @select="execute"
    />
  </div>
</template>
<script setup lang="ts">
  import { FILE_MENU, WORKSPACE_FILES, type WorkspaceFile } from './data'
  import type { ContextMenuItem } from '@robot-admin/naive-ui-components'
  defineOptions({ name: 'Demo51ContextMenu' })
  const message = useMessage()
  const files = ref(WORKSPACE_FILES.map(file => ({ ...file })))
  const selectedId = ref(files.value[0]?.id || '')
  const query = ref('')
  const removed = ref<{ file: WorkspaceFile; index: number } | null>(null)
  const activities = ref<string[]>([])
  const menu = ref<{
    open: (x: number, y: number) => void
    close: () => void
  }>()
  const selectedFile = computed(() =>
    files.value.find(file => file.id === selectedId.value)
  )
  const filteredFiles = computed(() =>
    files.value.filter(file =>
      file.name.toLowerCase().includes(query.value.trim().toLowerCase())
    )
  )
  /** 文件大小取实际 UTF-8 内容字节数。 */
  const fileSize = (content: string) =>
    `${(new TextEncoder().encode(content).length / 1024).toFixed(1)} KB`
  /** 保持菜单上下文与当前资源一致。 */
  const openPointerMenu = (event: MouseEvent, file: WorkspaceFile) => {
    selectedId.value = file.id
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    menu.value?.open(
      event.clientX || rect.left + 20,
      event.clientY || rect.top + 20
    )
  }
  /** 键盘调用时将菜单放在目标资源内部。 */
  const openKeyboardMenu = (event: KeyboardEvent, file: WorkspaceFile) => {
    selectedId.value = file.id
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    menu.value?.open(rect.left + 45, rect.top + 25)
  }
  /** 下载当前副本的真实内容。 */
  const downloadFile = (file: WorkspaceFile) => {
    const url = URL.createObjectURL(
      new Blob([file.content], { type: 'text/plain;charset=utf-8' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  /** 复制资源，不触碰实际项目文件。 */
  const duplicateFile = (file: WorkspaceFile) => {
    const duplicate = {
      ...file,
      id: crypto.randomUUID(),
      name: file.name.replace(/(\.[^.]+)$/, '-copy$1'),
    }
    files.value.push(duplicate)
    selectedId.value = duplicate.id
  }
  /** 移除副本并保留一次撤销记录。 */
  const removeFile = (file: WorkspaceFile) => {
    const index = files.value.findIndex(candidate => candidate.id === file.id)
    removed.value = { file: { ...file }, index }
    files.value.splice(index, 1)
    selectedId.value = files.value[index]?.id || files.value[0]?.id || ''
  }
  const operations: Record<
    string,
    (file: WorkspaceFile) => void | Promise<void>
  > = {
    preview: () =>
      document.querySelector<HTMLElement>('.resource-preview pre')?.focus(),
    'copy-name': file => navigator.clipboard.writeText(file.name),
    'copy-content': file => navigator.clipboard.writeText(file.content),
    download: downloadFile,
    duplicate: duplicateFile,
    remove: removeFile,
  }
  /** 执行真实的浏览器本地操作；异步复制失败时不伪报成功。 */
  const execute = async (item: ContextMenuItem) => {
    const file = selectedFile.value
    const operation = operations[item.key]
    if (!file || !operation) return
    try {
      await operation(file)
      activities.value.push(`${item.label} · ${file.name}`)
    } catch {
      message.error('浏览器未允许复制，请选择预览内容手动复制')
    }
  }
  /** 恢复最近一次移除的副本及其原始位置。 */
  const undo = () => {
    if (!removed.value) return
    files.value.splice(removed.value.index, 0, removed.value.file)
    selectedId.value = removed.value.file.id
    activities.value.push(`已恢复 · ${removed.value.file.name}`)
    removed.value = null
  }
  onDeactivated(() => menu.value?.close())
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
