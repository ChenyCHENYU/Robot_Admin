/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 14:12:33
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 14:12:42
 * @FilePath: \Robot_Admin\src\views\demo\17-export-zip\data.ts
 * @Description: 导出zip 场景示例相关数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { UploadFileInfo } from 'naive-ui/es/upload'

// ==================== 类型定义 ====================

// 框架类型
export type FrameworkType = 'vue' | 'react' | 'nodejs' | 'vanilla'

// 打包模式类型
export type BundleModeType = 'separate' | 'combined'

// 格式类型
export type FormatType = 'excel' | 'csv' | 'json'

// 模板ID类型
export type TemplateId =
  'vue-component' | 'react-hook' | 'typescript-utils' | 'nodejs-api'

// 模板定义接口
export interface TemplateDefinition {
  readonly id: TemplateId
  readonly name: string
  readonly category: string
}

// 模板文件映射
export type TemplateFiles = Record<TemplateId, Record<string, string>>

// 媒体配置接口（扩展）
export interface MediaConfigExtended {
  packageName: string
  organizeByCategory: boolean
  includeMetadata: boolean
  maxFileSize: number
}

// 报表配置接口（扩展）
export interface ReportConfigExtended {
  title: string
  format: FormatType
  dateRange: [number, number] | null
  includeSummary: boolean
}

// 有效的上传文件类型
export interface ValidUploadFile extends UploadFileInfo {
  file: File
  name: string
}

// ==================== 选项配置 ====================

export const frameworkOptions = [
  { label: 'Vue 3', value: 'vue' as const },
  { label: 'React', value: 'react' as const },
  { label: 'Node.js', value: 'nodejs' as const },
  { label: 'Vanilla JS', value: 'vanilla' as const },
]

export const formatOptions = [
  { label: 'Excel (.csv)', value: 'excel' as const },
  { label: 'CSV (.csv)', value: 'csv' as const },
  { label: 'JSON (.json)', value: 'json' as const },
]

export const bundleModeOptions = [
  { label: '分离模式', value: 'separate' as const },
  { label: '合并模式', value: 'combined' as const },
]

export const availableTemplates: readonly TemplateDefinition[] = [
  { id: 'vue-component', name: 'Vue 组件', category: 'Vue' },
  { id: 'react-hook', name: 'React Hook', category: 'React' },
  { id: 'typescript-utils', name: 'TS 工具', category: 'TypeScript' },
  { id: 'nodejs-api', name: 'Node API', category: 'Backend' },
] as const

// ==================== 模拟数据 ====================

export const mockDataList = [
  { id: 1, name: '产品A', value: 1200, date: '2024-01-15' },
  { id: 2, name: '产品B', value: 850, date: '2024-01-16' },
  { id: 3, name: '产品C', value: 1500, date: '2024-01-17' },
  { id: 4, name: '产品D', value: 920, date: '2024-01-18' },
  { id: 5, name: '产品E', value: 1100, date: '2024-01-19' },
]

export const defaultCodeContent =
  `<template>
  <div class="app">
    <h1>{{ title }}</h1>
    <NButton @click="handleClick" type="primary">
      点击计数: {{ count }}
    </NButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'

const title = ref('Hello Vue 3!')
const count = ref(0)

const handleClick = () => {
  count.value++
}
</` +
  `script>

<style scoped>
.app {
  text-align: center;
  padding: 20px;
}
</style>`

// ==================== 工具函数 ====================

/**
 * * @description 获取模板文件映射
 * ? @param templateId - 模板ID
 * ! @return 模板文件对象
 */
export const getTemplateFiles = (
  templateId: TemplateId
): Record<string, string> => {
  const templates: TemplateFiles = {
    'vue-component': {
      'Component.vue': '<template>\n  <div>{{ message }}</div>\n</template>',
      'index.ts': 'export { default } from "./Component.vue"',
    },
    'react-hook': {
      'useHook.ts':
        'import { useState } from "react"\nexport const useHook = () => useState(0)',
    },
    'typescript-utils': {
      'utils.ts':
        'export const formatDate = (date: Date) => date.toISOString()',
    },
    'nodejs-api': {
      'server.js':
        'const express = require("express")\nconst app = express()\napp.listen(3000)',
    },
  }
  return templates[templateId] || {}
}

/**
 * * @description 根据 MIME 类型获取文件分类
 * ? @param mimeType - MIME 类型字符串
 * ! @return 文件分类
 */
export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}

/**
 * * @description 类型守卫 - 检查是否为有效的上传文件
 * ? @param fileItem - 上传文件项
 * ! @return 是否为有效文件
 */
export const isValidUploadFile = (
  fileItem: UploadFileInfo
): fileItem is ValidUploadFile => {
  return fileItem.file instanceof File && typeof fileItem.name === 'string'
}
