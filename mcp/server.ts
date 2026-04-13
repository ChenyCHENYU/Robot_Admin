/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-04-13
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-04-13
 * @FilePath: \Robot_Admin\mcp\server.ts
 * @Description: Robot Admin MCP Server
 *   为 AI 工具提供组件库 / 路由 / API 的实时查询能力。
 *   启动方式：bun run mcp/server.ts
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 项目根目录（mcp/ 的上一级），兼容 Node.js/Bun 双运行时 */
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

// ─────────────────────────────────────────
// 工具实现
// ─────────────────────────────────────────

/**
 * * @description: 列出 naive-ui-components 全部 C_ 组件名
 */
function listComponents(): string {
  const distDir = join(
    ROOT,
    'node_modules/@robot-admin/naive-ui-components/dist'
  )
  if (!existsSync(distDir)) {
    return '未找到 @robot-admin/naive-ui-components，请先执行 bun install'
  }
  const names = readdirSync(distDir)
    .filter((f: string) => /^C_[A-Z].+\.d\.ts$/.test(f))
    .map((f: string) => f.replace('.d.ts', ''))
    .sort()
  return `共 ${names.length} 个 C_ 组件：\n\n${names.join('\n')}`
}

/**
 * * @description: 返回指定组件的 .d.ts 类型声明
 * ? @param {string} name 组件名，如 C_Form / Form
 */
function getComponentApi(name: string): string {
  const normalized = name.startsWith('C_') ? name : `C_${name}`
  const filePath = join(
    ROOT,
    'node_modules/@robot-admin/naive-ui-components/dist',
    `${normalized}.d.ts`
  )
  if (!existsSync(filePath)) {
    return `找不到组件 "${normalized}"。请先用 list_components 查看全部可用组件。`
  }
  return readFileSync(filePath, 'utf-8')
}

/**
 * * @description: 将 dynamicRouter.json 展平为路由列表
 */
function listRoutes(): string {
  const routerPath = join(ROOT, 'src/assets/data/dynamicRouter.json')
  if (!existsSync(routerPath))
    return '未找到 src/assets/data/dynamicRouter.json'

  const data: { code: string; data: any[] } = JSON.parse(
    readFileSync(routerPath, 'utf-8')
  )

  const rows: {
    path: string
    name: string
    title: string
    keepAlive: boolean
  }[] = []

  /**
   * * @description: 拼接完整路由路径
   * ? @param {string} parentPath 父路径
   * ? @param {string} childPath 子路径
   * ! @return {string} 规范化后的完整路径
   */
  function buildFullPath(parentPath: string, childPath?: string): string {
    if (!childPath) return parentPath
    if (childPath.startsWith('/')) return childPath
    return `${parentPath}/${childPath}`.replace(/\/+/g, '/')
  }

  /**
   * * @description: 递归遍历路由树，收集叶子节点
   * ? @param {any[]} items 当前层路由列表
   * ? @param {string} parentPath 父路径（默认空字符串）
   */
  function traverse(items: any[], parentPath = '') {
    for (const item of items) {
      const fullPath = buildFullPath(parentPath, item.path)
      if (item.children?.length) {
        traverse(item.children, fullPath)
      } else if (item.name) {
        rows.push({
          path: fullPath,
          name: item.name,
          title: item.meta?.title ?? '',
          keepAlive: item.meta?.keepAlive ?? false,
        })
      }
    }
  }

  traverse(data.data ?? [])

  const lines = rows.map(
    r =>
      `${r.path.padEnd(52)} ${r.name.padEnd(38)} "${r.title}"${r.keepAlive ? '  [keepAlive]' : ''}`
  )
  return `共 ${rows.length} 个叶子路由：\n\n${'路径'.padEnd(52)} ${'name'.padEnd(38)} title\n${'-'.repeat(110)}\n${lines.join('\n')}`
}

/**
 * * @description: 扫描 src/api/ 导出的请求函数
 */
function listApiEndpoints(): string {
  const apiDir = join(ROOT, 'src/api')
  if (!existsSync(apiDir)) return '未找到 src/api 目录'

  const blocks: string[] = []

  for (const entry of readdirSync(apiDir)) {
    if (!entry.endsWith('.ts')) continue
    const fullPath = join(apiDir, entry)
    if (statSync(fullPath).isDirectory()) continue

    const content = readFileSync(fullPath, 'utf-8')
    const matches = [...content.matchAll(/export const (\w+)\s*=/g)].map(
      m => m[1]
    )
    if (matches.length) {
      blocks.push(`\n## ${entry}\n${matches.map(n => `  - ${n}`).join('\n')}`)
    }
  }

  return blocks.length
    ? `src/api/ 所有导出函数：${blocks.join('\n')}`
    : '未找到有效的 API 函数（文件名需以 .ts 结尾）'
}

/**
 * * @description: 返回 @robot-admin/form-validate 的 PRESET_RULES 定义
 */
function getPresetRules(): string {
  const typesPath = join(
    ROOT,
    'node_modules/@robot-admin/form-validate/dist/index.d.ts'
  )
  if (!existsSync(typesPath)) {
    return '未找到 @robot-admin/form-validate，请先执行 bun install'
  }
  const content = readFileSync(typesPath, 'utf-8')
  const idx = content.indexOf('PRESET_RULES')
  // 返回 PRESET_RULES 所在位置起的 3000 字符，涵盖全部规则定义
  return idx === -1 ? content.slice(0, 3000) : content.slice(idx, idx + 3000)
}

// ─────────────────────────────────────────
// MCP Server 注册
// ─────────────────────────────────────────

const server = new Server(
  { name: 'robot-admin-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

/** 工具列表声明 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_components',
      description:
        '列出 @robot-admin/naive-ui-components 所有可用的 C_ 组件（51+个）。不确定哪些组件可用时优先调用此工具。',
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'get_component_api',
      description:
        '获取指定 C_ 组件的完整 TypeScript 类型定义（Props / Emits / Exports）。编写使用该组件的代码前必须调用，避免猜测 Props 名称。',
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description:
              '组件名称，如 C_Form / C_Table / C_Upload，可省略 C_ 前缀',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'list_routes',
      description:
        '列出项目所有已注册的动态路由（path / name / title / keepAlive）。注册新路由或跳转前调用，避免与现有路由冲突。',
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'list_api_endpoints',
      description:
        '列出 src/api/ 下所有已定义的 API 请求函数，按文件分组。引用接口前调用，确认函数名称是否已存在。',
      inputSchema: { type: 'object' as const, properties: {} },
    },
    {
      name: 'get_preset_rules',
      description:
        '获取 @robot-admin/form-validate 的 PRESET_RULES 可用验证规则列表。编写表单验证规则前调用。',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ],
}))

/** 工具调用处理 */
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args = {} } = request.params

  try {
    let text: string
    switch (name) {
      case 'list_components':
        text = listComponents()
        break
      case 'get_component_api':
        text = getComponentApi((args as Record<string, string>).name ?? '')
        break
      case 'list_routes':
        text = listRoutes()
        break
      case 'list_api_endpoints':
        text = listApiEndpoints()
        break
      case 'get_preset_rules':
        text = getPresetRules()
        break
      default:
        text = `未知工具：${name}`
    }
    return { content: [{ type: 'text' as const, text }] }
  } catch (err) {
    return {
      content: [{ type: 'text' as const, text: `执行出错：${String(err)}` }],
      isError: true,
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
