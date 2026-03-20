/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-21 16:54:11
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-21 16:54:11
 * @FilePath: \Robot_Admin\src\views\demo\15-markdown-editor\data.ts
 * @Description: Markdown 编辑器演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 类型定义
 */
export interface ArticleData {
  id: number
  title: string
  author: string
  createTime: string
  updateTime: string
  content: string
}

export interface CategoryOption {
  label: string
  value: string
}

export interface FormRules {
  [key: string]: {
    required: boolean
    message: string
    trigger: string
  }
}

export type InsertImageFunction = (config: {
  url: string
  desc?: string
  width?: string | number
  height?: string | number
}) => void

/**
 * 基础内容模板
 */
export const defaultBasicContent = `# 欢迎使用 Markdown 编辑器

## 🚀 功能特性

- ✅ **实时预览**: 支持编辑与预览同步滚动
- ✅ **语法高亮**: 代码块语法高亮显示
- ✅ **图片上传**: 支持拖拽和粘贴上传图片
- ✅ **自动保存**: 可配置自动保存功能
- ✅ **字数统计**: 实时显示字数统计
- ✅ **全屏编辑**: 支持全屏编辑模式

## 📝 语法示例

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, Markdown!');
}
\`\`\`

### 表格
| 功能 | 描述 | 状态 |
|-----|------|------|
| 编辑 | Markdown 编辑 | ✅ |
| 预览 | 实时预览 | ✅ |
| 保存 | 自动保存 | ✅ |

### 列表
1. 有序列表项 1
2. 有序列表项 2
   - 无序子列表
   - 另一个子列表

> **提示**: 这是一个引用块，可以用来突出重要信息。

**粗体文本** 和 *斜体文本*

[链接示例](https://github.com)
`

/**
 * 表单验证规则
 */
export const formRules: FormRules = {
  title: { required: true, message: '请输入文章标题', trigger: 'blur' },
  summary: { required: true, message: '请输入文章摘要', trigger: 'blur' },
  category: { required: true, message: '请选择文章分类', trigger: 'change' },
  content: { required: true, message: '请输入文章内容', trigger: 'blur' },
}

/**
 * 分类选项
 */
export const categoryOptions: CategoryOption[] = [
  { label: '技术分享', value: 'tech' },
  { label: '生活随笔', value: 'life' },
  { label: '项目总结', value: 'project' },
  { label: '学习笔记', value: 'notes' },
]

/**
 * 不同模式演示内容
 */
export const defaultModeContent = {
  edit: '# 编辑模式\n\n这是编辑模式，支持编辑和预览切换。',
  editable: '# 可编辑模式\n\n这是可编辑模式，实时渲染 Markdown。',
  preview: '# 预览模式\n\n这是预览模式，**只能查看**，不能编辑。',
}

/**
 * 配置选项默认值
 */
export const defaultConfig = {
  disabled: false,
  autofocus: false,
  defaultFullscreen: false,
  autoSave: false,
  height: 400,
}

/**
 * 配置内容模板
 */
export const defaultConfigContent =
  '# 配置演示\n\n请在左侧调整配置选项，观察编辑器的变化。\n\n## TOC 导航\n\n### 小标题 1\n\n### 小标题 2\n\n### 小标题 3'

/**
 * 插入模板
 */
export const insertTemplate = `
## 新增内容

### 代码示例
\`\`\`javascript
console.log('Hello World!');
\`\`\`

### 任务列表
- [x] 已完成的任务
- [ ] 待完成的任务
`

/**
 * 模拟文章数据
 */
export const mockArticles: ArticleData[] = [
  {
    id: 1,
    title: 'Vue 3 组件设计最佳实践',
    author: 'ChenYu',
    createTime: '2025-06-15 10:30:00',
    updateTime: '2025-06-20 14:20:00',
    content: `# Vue 3 组件设计最佳实践

## 前言

在 Vue 3 开发中，良好的组件设计是项目成功的关键。本文将分享一些实用的组件设计原则和最佳实践。

## 1. 组件职责单一

每个组件应该只负责一个明确的功能，避免组件过于复杂。

\`\`\`vue
<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="user.name" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.title }}</p>
  </div>
</template>
\`\`\`

## 2. Props 设计原则

- 明确的类型定义
- 合理的默认值
- 清晰的命名

## 3. 事件处理

使用 \`defineEmits\` 明确定义组件事件。

## 总结

良好的组件设计能够提高代码的可维护性和复用性。`,
  },
  {
    id: 2,
    title: 'TypeScript 在前端项目中的应用',
    author: 'ChenYu',
    createTime: '2025-06-10 09:15:00',
    updateTime: '2025-06-18 16:45:00',
    content: `# TypeScript 在前端项目中的应用

## 为什么选择 TypeScript?

TypeScript 为 JavaScript 添加了类型系统，能够在开发阶段发现潜在的错误。

## 基础类型

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = {
  id: 1,
  name: 'John Doe'
};
\`\`\`

## 泛型的使用

泛型是 TypeScript 的强大特性之一。

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## 在 Vue 项目中的应用

结合 Vue 3 的 Composition API，TypeScript 能够提供更好的开发体验。`,
  },
  {
    id: 3,
    title: 'Markdown 编辑器的实现思路',
    author: 'ChenYu',
    createTime: '2025-06-08 15:20:00',
    updateTime: '2025-06-19 11:30:00',
    content: `# Markdown 编辑器的实现思路

## 核心功能

一个完整的 Markdown 编辑器需要具备以下功能：

1. **语法解析**: 将 Markdown 语法转换为 HTML
2. **实时预览**: 编辑时实时显示渲染效果
3. **语法高亮**: 在编辑区域高亮显示语法
4. **工具栏**: 提供常用的格式化按钮

## 技术选型

- **解析器**: markdown-it
- **高亮**: highlight.js
- **编辑器**: CodeMirror 或自定义

## 实现细节

### 1. 基础结构

\`\`\`vue
<template>
  <div class="markdown-editor">
    <div class="editor-panel">
      <textarea v-model="content" />
    </div>
    <div class="preview-panel">
      <div v-html="htmlContent" />
    </div>
  </div>
</template>
\`\`\`

### 2. 实时渲染

使用 \`watch\` 监听内容变化，实时更新预览。

## 总结

构建一个功能完整的 Markdown 编辑器需要考虑用户体验、性能优化等多个方面。`,
  },
]
