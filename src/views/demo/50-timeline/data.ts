/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\demo\50-timeline\data.ts
 * @Description: 真实发布记录与项目验证流程
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import changelog from '../../../../CHANGELOG.md?raw'
import projectInfo from 'virtual:robot-admin-project-info'
import type { TimelineItem } from '@robot-admin/naive-ui-components'
import { parseReleaseRecords, releaseNotesHtml } from './core'
export const applicationVersion = projectInfo.version
export const RELEASES = parseReleaseRecords(changelog)
export const RELEASE_TIMELINE: TimelineItem[] = RELEASES.map(release => ({
  id: release.version,
  title: `v${release.version}`,
  time: release.date,
  content: releaseNotesHtml(release.notes),
  icon: 'mdi:source-commit',
  status: 'success',
  collapsible: true,
  defaultExpanded: release.version === projectInfo.version,
  tags: [
    {
      text:
        release.version === projectInfo.version ? '当前应用版本' : '发布记录',
      type: release.version === projectInfo.version ? 'info' : 'default',
    },
  ],
}))
export const VERIFY_TIMELINE: TimelineItem[] = [
  {
    id: 'lint',
    title: '代码检查',
    content: 'bun run lint:check / bun run lint:eslint',
    icon: 'mdi:code-braces',
    status: 'info',
  },
  {
    id: 'types',
    title: '类型校验',
    content: 'bun run type-build',
    icon: 'mdi:language-typescript',
    status: 'info',
  },
  {
    id: 'test',
    title: '行为测试',
    content: 'bun test --max-concurrency=1',
    icon: 'mdi:test-tube',
    status: 'info',
  },
  {
    id: 'build',
    title: '生产构建',
    content: 'bun run build',
    icon: 'mdi:package-variant-closed',
    status: 'info',
  },
  {
    id: 'budget',
    title: '体积预算',
    content: 'bun run check:bundle',
    icon: 'mdi:scale-balance',
    status: 'info',
  },
  {
    id: 'application',
    title: '应用模式验证',
    content: 'bun run build:application',
    icon: 'mdi:application-brackets-outline',
    status: 'info',
  },
]
