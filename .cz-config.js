/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-03 16:28:40
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-10-27 09:01:36
 * @FilePath: \Robot_Admin\.cz-config.js
 * @Description: commitizen 中 cz-customizable 自定义配置文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
// .cz-config.js
module.exports = {
  // 你可以把常用模块填进来，方便选择；也可留空配合 allowCustomScopes
  scopes: [],
  allowEmptyScopes: false,
  allowCustomScopes: true,

  // 提交类型：补上 deps，明确 fix/perf/deps 都会走 patch
  types: [
    { value: 'wip', name: 'wip:      🚧 开发中' },
    { value: 'feat', name: 'feat:     🎯 新功能' },
    { value: 'fix', name: 'fix:      🐛 Bug 修复（会触发 patch）' },
    { value: 'perf', name: 'perf:     ⚡️ 性能优化（会触发 patch）' },
    { value: 'deps', name: 'deps:     📦 依赖更新（会触发 patch）' },
    { value: 'refactor', name: 'refactor: ♻️  重构（不改变行为）' },
    { value: 'docs', name: 'docs:     📚 文档变更' },
    { value: 'test', name: 'test:     🔎 测试相关' },
    { value: 'style', name: 'style:    💄 代码样式（空格、分号等）' },
    { value: 'build', name: 'build:    🧳 构建/打包' },
    { value: 'chore', name: 'chore:    🔧 其他杂项' },
    { value: 'revert', name: 'revert:   🔙 回退' },
  ],

  messages: {
    type: '请选择提交类型:',
    // scope 必填能提高可读性；你可以改成“可选”，把 allowEmptyScopes 设为 true
    customScope: '请输入修改范围(必填，格式如：模块/子模块):',
    subject: '请简要描述提交(必填，不加句号):',
    // body 用于详细说明，原来你跳过了 body；如果你想精简，可保留跳过
    body: '请输入更详细的说明(可选):\n',
    // footer 里我们支持 2 类信息：关联 issue、以及 Release-As 强制版本
    footer: 'Footer(可选): 例如 "Closes #123" 或 "Release-As: 1.3.1"\n',
    confirmCommit: '确认提交以上内容？(y/n/e/h)',
  },

  // 如果你想继续精简，也可以保持跳过 body；footer 建议不要跳过，方便偶尔用 Release-As
  skipQuestions: ['body'],

  // 允许 “破坏性变更” 提示（会触发 major）
  allowBreakingChanges: ['feat', 'fix', 'refactor'],
  breakingPrefix: 'BREAKING CHANGE:',

  // 主题长度限制
  subjectLimit: 88,
}



