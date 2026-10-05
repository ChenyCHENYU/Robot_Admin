/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\51-context-menu\data.ts
 * @Description: 项目公开配置的资源副本与上下文操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import projectInfo from 'virtual:robot-admin-project-info'
import type { ContextMenuItem } from '@robot-admin/naive-ui-components'
export interface WorkspaceFile {
  id: string
  name: string
  type: string
  icon: string
  content: string
}
export const WORKSPACE_FILES: WorkspaceFile[] = [
  {
    id: 'package',
    name: 'package.json',
    type: 'JSON',
    icon: 'mdi:nodejs',
    content: JSON.stringify(
      {
        name: 'robot-admin',
        version: projectInfo.version,
        dependencies: Object.fromEntries(
          projectInfo.dependencies.map(item => [
            item.name,
            item.declaredVersion,
          ])
        ),
      },
      null,
      2
    ),
  },
  {
    id: 'guide',
    name: 'component-usage.vue',
    type: 'Vue',
    icon: 'mdi:vuejs',
    content:
      '<template>\n  <C_Transfer v-model="selected" :data="items" filterable />\n</template>\n\n<script setup lang="ts">\n  const selected = ref([])\n  const items = [{ key: "home", label: "首页工作台" }]\n</script>\n\n<!-- 项目通过 RobotNaiveUiResolver 自动引入组件与样式。 -->',
  },
  {
    id: 'workflow',
    name: 'verify-notes.md',
    type: 'Markdown',
    icon: 'mdi:language-markdown',
    content:
      '# Robot Admin 验证流程\n\n- bun run lint:check\n- bun run lint:eslint\n- bun run type-build\n- bun test --max-concurrency=1\n- bun run build\n- bun run check:bundle\n- bun run build:application\n\n这里是上下文菜单演示资源的本地副本。',
  },
  {
    id: 'selection',
    name: 'selection-example.json',
    type: 'JSON',
    icon: 'mdi:code-json',
    content: JSON.stringify(
      { scope: 'local-demo', selected: ['layout', 'theme', 'components'] },
      null,
      2
    ),
  },
]
export const FILE_MENU: ContextMenuItem[] = [
  { key: 'preview', label: '查看内容', icon: 'mdi:eye-outline' },
  {
    key: 'copy',
    label: '复制',
    icon: 'mdi:content-copy',
    children: [
      { key: 'copy-name', label: '复制文件名', icon: 'mdi:rename-outline' },
      { key: 'copy-content', label: '复制内容', icon: 'mdi:code-tags' },
    ],
  },
  { key: 'download', label: '下载副本', icon: 'mdi:download-outline' },
  { key: 'duplicate', label: '创建副本', icon: 'mdi:file-multiple-outline' },
  { key: 'divider', label: '', divider: true },
  {
    key: 'remote',
    label: '上传到服务器',
    icon: 'mdi:cloud-upload-outline',
    disabled: true,
  },
  {
    key: 'remove',
    label: '移除本地副本',
    icon: 'mdi:trash-can-outline',
    danger: true,
  },
]
