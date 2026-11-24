/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-21 16:54:11
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-21 16:54:11
 * @FilePath: \Robot_Admin\src\views\demo\15-markdown-editor\data.ts
 * @Description: Markdown 编辑器演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

export const WORKSPACE_DOCUMENTS = [
  {
    id: 'notes',
    name: '项目协作笔记.md',
    content:
      '# 项目协作笔记\n\n## 本周重点\n\n- [x] 确认交付范围\n- [ ] 完成体验走查\n- [ ] 整理验证记录\n\n## 协作约定\n\n把需求、设计与验收连接在同一条清晰路径上。\n\n> 此文档为本地演示笔记，可自由编辑。\n',
  },
  {
    id: 'release',
    name: '版本发布说明.md',
    content:
      '# 版本发布说明\n\n## 本次改进\n\n| 模块 | 改进 |\n| --- | --- |\n| 工作台 | 统一操作与留白 |\n| 数据 | 保持口径一致 |\n\n## 验证记录\n\n填写实际验证结果，再分享发布说明。\n',
  },
  {
    id: 'checklist',
    name: '体验走查清单.md',
    content:
      '# 体验走查清单\n\n- [ ] 主要操作有明确结果\n- [ ] 加载与错误状态可理解\n- [ ] 下载内容与当前选择一致\n- [ ] 明暗主题保持可读\n- [ ] 键盘操作能完成主要流程\n\n```typescript\nconst experience = { clear: true, useful: true }\n```\n',
  },
]
