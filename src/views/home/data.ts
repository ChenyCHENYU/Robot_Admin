/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\home\data.ts
 * @Description: 首页真实能力、授权功能入口与已安装生态包配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import projectInfo from 'virtual:robot-admin-project-info'
import { repositoryUrl } from './d_repository'

/** 功能入口通过当前授权菜单匹配路由名称，未授权项不显示。 */
export const workspaceEntryConfig = [
  {
    name: 'sys-user-manage',
    description: '维护用户与公司成员关系',
    icon: 'i-mdi:account-group-outline',
    category: '系统管理',
  },
  {
    name: 'sys-role-manage',
    description: '管理角色与权限分配',
    icon: 'i-mdi:shield-account-outline',
    category: '系统管理',
  },
  {
    name: 'demo-form',
    description: '查看配置化表单与字段联动',
    icon: 'i-mdi:form-select',
    category: '组件示例',
  },
  {
    name: 'demo-mach-table',
    description: '体验虚拟化表格与数据编辑',
    icon: 'i-mdi:table-large',
    category: '组件示例',
  },
  {
    name: 'work-flow',
    description: '查看节点与连线的可视化编排',
    icon: 'i-mdi:vector-combine',
    category: '编辑器',
  },
  {
    name: 'demo-upload',
    description: '查看文件选择与上传交互',
    icon: 'i-mdi:cloud-upload-outline',
    category: '插件示例',
  },
  {
    name: 'dashboard-analysis',
    description: '观察项目架构、构建与真实加载性能',
    icon: 'i-mdi:chart-box-outline',
    category: '仪表盘',
  },
  {
    name: 'about',
    description: '查看项目与实际依赖版本',
    icon: 'i-mdi:information-outline',
    category: '项目信息',
  },
]

export const capabilities = [
  {
    title: '公司与权限',
    description:
      '登录前选择工作公司；进入后切换公司，角色、菜单与页面状态同步更新。',
    icon: 'i-mdi:shield-check-outline',
  },
  {
    title: '配置化页面',
    description: '表单、表格、按钮组与校验规则分层组织，按需组合现有业务组件。',
    icon: 'i-mdi:view-dashboard-outline',
  },
  {
    title: '统一界面',
    description:
      '明暗主题、多种导航布局、全局搜索与功能引导使用同一套交互风格。',
    icon: 'i-mdi:palette-outline',
  },
  {
    title: '工程工具',
    description: 'Bun 管理依赖，类型检查、代码检查和浏览器回归辅助日常开发。',
    icon: 'i-mdi:code-braces',
  },
]

const ecosystemDescriptions: Record<string, string> = {
  '@robot-admin/naive-ui-components': '表单、表格、登录、引导等通用业务组件',
  '@robot-admin/request-core': '请求、认证恢复与 CRUD 编排',
  '@robot-admin/layout': '导航布局、页签与布局设置',
  '@robot-admin/theme': '主题核心与 Naive UI 主题适配',
  '@robot-admin/directives': '权限、复制、水印等 Vue 指令',
  '@robot-admin/form-validate': '校验规则、组合校验与表单适配',
  '@robot-admin/file-utils': '文件导出、下载与分片处理',
  '@robot-admin/git-standards': '提交规范与 Git 工程配置',
}

const dependencies = [
  ...projectInfo.dependencies,
  ...projectInfo.devDependencies,
]
export const projectVersion = projectInfo.version
export const ecosystemPackages = Object.entries(ecosystemDescriptions).flatMap(
  ([name, description]) => {
    const dependency = dependencies.find(item => item.name === name)
    return dependency
      ? [
          {
            ...dependency,
            description,
            shortName: name.replace('@robot-admin/', ''),
          },
        ]
      : []
  }
)

/** 四种架构均有实际仓库分支；当前页面运行单体 SPA，其他模式独立部署。 */
export const architectureModes = [
  {
    title: '单体 SPA',
    label: '当前应用',
    branch: 'main',
    description:
      '一套应用，完整工程基线。适合快速启动，也为其他架构提供统一能力。',
    icon: 'i-mdi:application-outline',
  },
  {
    title: 'Monorepo',
    label: '多应用协作',
    branch: 'monorepo',
    description:
      'Bun Workspaces 组织多个应用与共享包，让团队在同一仓库协作演进。',
    icon: 'i-mdi:source-repository-multiple',
  },
  {
    title: 'Module Federation',
    label: '运行时共享',
    branch: 'module-federation',
    description:
      'Host 与 Remote 按需组合，通过模块联邦共享能力，支持独立构建。',
    icon: 'i-mdi:vector-link',
  },
  {
    title: 'MicroApp',
    label: '微前端集成',
    branch: 'micro-app',
    description: '以主应用承载子应用，结合沙箱与通信机制组织独立业务模块。',
    icon: 'i-mdi:puzzle-outline',
  },
].map(mode => ({ ...mode, url: `${repositoryUrl}/tree/${mode.branch}` }))

/** 用现有生态包说明插件化分层，详细安装版本交给关于页。 */
export const platformLayers = [
  {
    number: '01',
    title: '工程核心',
    description: '请求、认证、主题与布局各自独立。',
    packages: 'request-core · theme · layout',
  },
  {
    number: '02',
    title: '业务插件',
    description: '表单、表格、校验与文件能力按需组合。',
    packages: 'naive-ui-components · form-validate · file-utils',
  },
  {
    number: '03',
    title: '应用交付',
    description: '从单体到多应用，按业务边界选择架构。',
    packages: 'SPA · Monorepo · Federation · MicroApp',
  },
]

/** 链接来自本项目仓库与实际安装的组件包。 */
export const projectResources = [
  {
    title: '项目仓库',
    description: '源码、版本与更新记录',
    url: repositoryUrl,
    icon: 'i-mdi:github',
  },
  {
    title: '项目文档',
    description: '安装、配置与开发说明',
    url: 'https://github.com/ChenyCHENYU/Robot_Admin#readme',
    icon: 'i-mdi:book-open-page-variant-outline',
  },
  {
    title: '组件库',
    description: '@robot-admin/naive-ui-components',
    url: 'https://www.npmjs.com/package/@robot-admin/naive-ui-components',
    icon: 'i-mdi:package-variant-closed',
  },
]
