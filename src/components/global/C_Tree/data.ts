import type { TreeMode, TreeProps } from '@/types/modules/tree'

/** 预设模式配置映射 */
export const presetConfigs: Record<TreeMode, Partial<TreeProps>> = {
  menu: {
    draggable: true,
    showLine: true,
    iconConfig: {
      typeMap: {
        directory: 'mdi:folder',
        menu: 'mdi:file-document',
        button: 'mdi:button-cursor',
      },
    },
    actions: [
      {
        key: 'add',
        text: '新增子菜单',
        icon: 'mdi:plus',
        type: 'primary',
      },
      {
        key: 'edit',
        text: '编辑',
        icon: 'mdi:pencil',
        type: 'info',
      },
      {
        key: 'delete',
        text: '删除',
        icon: 'mdi:delete',
        type: 'error',
        confirm: '确认删除该菜单吗？',
      },
    ],
  },
  file: {
    draggable: false,
    showLine: false,
    iconConfig: {
      typeMap: {
        folder: 'mdi:folder',
        file: 'mdi:file-document',
        image: 'mdi:file-image',
        video: 'mdi:file-video',
        audio: 'mdi:file-music',
      },
    },
    actions: [
      {
        key: 'open',
        text: '打开',
        icon: 'mdi:folder-open',
        type: 'primary',
      },
      {
        key: 'rename',
        text: '重命名',
        icon: 'mdi:rename-box',
        type: 'info',
      },
      {
        key: 'delete',
        text: '删除',
        icon: 'mdi:delete',
        type: 'error',
        confirm: '确认删除该文件吗？',
      },
    ],
  },
  org: {
    draggable: false,
    showLine: true,
    iconConfig: {
      typeMap: {
        department: 'mdi:domain',
        user: 'mdi:account',
        manager: 'mdi:account-tie',
      },
    },
    actions: [
      {
        key: 'add',
        text: '新增下级',
        icon: 'mdi:plus',
        type: 'primary',
      },
      {
        key: 'edit',
        text: '编辑',
        icon: 'mdi:pencil',
        type: 'info',
      },
    ],
  },
  custom: {},
}
