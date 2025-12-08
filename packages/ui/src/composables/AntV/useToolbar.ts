import type { ToolbarAction } from '@/types/antv'

/**
 * @description: 工具栏
 */
export function useToolbar() {
  const activeAction = ref<ToolbarAction | null>(null)

  // 文件菜单选项
  const fileMenuOptions = [
    { label: '新建', key: 'new', icon: 'icon-plus' },
    { label: '打开', key: 'open', icon: 'icon-folder-open' },
    { label: '保存', key: 'save', icon: 'icon-save' },
    { label: '另存为', key: 'save-as', icon: 'icon-save' },
    { type: 'divider' },
    { label: '导入', key: 'import', icon: 'icon-import' },
  ]

  // 编辑菜单选项
  const editMenuOptions = [
    { label: '撤销', key: 'undo', icon: 'icon-undo', shortcut: 'Ctrl+Z' },
    { label: '重做', key: 'redo', icon: 'icon-redo', shortcut: 'Ctrl+Y' },
    { type: 'divider' },
    { label: '复制', key: 'copy', icon: 'icon-copy', shortcut: 'Ctrl+C' },
    { label: '粘贴', key: 'paste', icon: 'icon-paste', shortcut: 'Ctrl+V' },
    { label: '删除', key: 'delete', icon: 'icon-delete', shortcut: 'Delete' },
    { type: 'divider' },
    {
      label: '全选',
      key: 'select-all',
      icon: 'icon-select',
      shortcut: 'Ctrl+A',
    },
    { label: '清空', key: 'clear', icon: 'icon-clear' },
  ]

  // 导出菜单选项
  const exportMenuOptions = [
    { label: '导出为PNG', key: 'png', icon: 'icon-picture' },
    { label: '导出为JPG', key: 'jpg', icon: 'icon-picture' },
    { label: '导出为SVG', key: 'svg', icon: 'icon-svg' },
    { label: '导出为PDF', key: 'pdf', icon: 'icon-pdf' },
    { type: 'divider' },
    { label: '导出数据', key: 'json', icon: 'icon-data' },
  ]

  // 布局菜单选项
  const layoutMenuOptions = [
    { label: '自动布局', key: 'auto', icon: 'icon-layout' },
    { label: '层次布局', key: 'hierarchical', icon: 'icon-tree' },
    { label: '力导向布局', key: 'force', icon: 'icon-dot-chart' },
    { label: '网格布局', key: 'grid', icon: 'icon-grid' },
    { label: '圆形布局', key: 'circular', icon: 'icon-circle' },
  ]

  const setActiveAction = (action: ToolbarAction | null) => {
    activeAction.value = action
  }

  return {
    activeAction: readonly(activeAction),
    fileMenuOptions,
    editMenuOptions,
    exportMenuOptions,
    layoutMenuOptions,
    setActiveAction,
  }
}
