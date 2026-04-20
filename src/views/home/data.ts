// 项目统计数据
export const projectStats = [
  { icon: 'fluent-color:approvals-app-16', number: '当前', label: 'Monomer' },
  {
    icon: 'fluent-color:animal-paw-print-20',
    number: '已完成',
    label: 'Monorepo',
  },
  {
    icon: 'fluent-color:puzzle-piece-20',
    number: '已完成',
    label: '模块联邦',
  },
  { icon: 'fluent-color:flag-24', number: '已完成', label: 'MicroApp' },
  { icon: 'fluent-color:beach-28', number: '规划中', label: 'NestJS' },
]

// 操作按钮
export const actionButtons = [
  {
    text: '在线演示',
    icon: '▶️',
    secondary: true,
    strong: true,
    type: 'primary',
    url: 'https://robotadmin.cn',
  },
  {
    text: 'GitHub 仓库',
    icon: '🐙',
    url: 'https://github.com/ChenyCHENYU/Robot_Admin',
  },
  {
    text: '查看文档',
    icon: '📄',
    tertiary: true,
    url: 'https://www.tzagileteam.com/robot/components/preface',
  },
  {
    text: 'NPM 组件库',
    icon: '📦',
    tertiary: true,
    url: 'https://www.npmjs.com/package/@nicecool/naive-ui-components',
  },
]

// 作者统计 - 动态获取GitHub仓库数据
export const authorStats = [
  { number: '12K+', label: '⭐Star' },
  { number: '212+', label: '🍴Forks' },
  { number: '1.2K+', label: '📝Commits' },
]

// 核心亮点（整合功能模块与核心特性）
export const highlights = [
  {
    name: 'RBAC 权限系统',
    icon: 'mdi:shield-lock-outline',
    desc: '角色/菜单/按钮三级权限体系，动态路由按需加载，前后端联动控制',
    tech: 'Vue Router · Pinia',
  },
  {
    name: '表单引擎',
    icon: 'mdi:form-select',
    desc: '动态表单生成，8 种布局模式，48+ 验证规则内置，支持联动配置',
    tech: 'C_Form · @robot-admin/form-validate',
  },
  {
    name: '表格组件',
    icon: 'mdi:table-large',
    desc: '增删改查一体化，行内/弹窗/单元格编辑，虚拟滚动，支持导出 Excel',
    tech: 'C_Table · useTableCrud',
  },
  {
    name: '工作流引擎',
    icon: 'mdi:vector-combine',
    desc: '可视化流程设计，拖拽连线，审批/通知节点，支持复杂业务流',
    tech: 'Vue Flow · AntV X6',
  },
  {
    name: '多架构支持',
    icon: 'mdi:layers-triple-outline',
    desc: '单体 / Monorepo / 模块联邦 / 微前端四种架构已全量验证交付',
    tech: 'Vite · Module Federation',
  },
  {
    name: '开源组件库',
    icon: 'mdi:puzzle-outline',
    desc: '51+ 高质量业务组件，独立 NPM 发布，支持按需导入与主题覆盖',
    tech: '@robot-admin/naive-ui-components',
  },
]

// 技术架构层级
export const techLayers = [
  {
    name: '前端框架层',
    icon: '🖥️',
    className: 'layer-frontend',
    tagType: 'info',
    techs: ['Vue 3.5.13', 'TypeScript 5.8', 'Naive UI 2.41', 'UnoCSS 66.3'],
  },
  {
    name: '构建工具层',
    icon: '⚡',
    className: 'layer-build',
    tagType: 'success',
    techs: ['Vite 7.0', 'Bun 1.x', 'Sass 1.87', 'Unplugin'],
  },
  {
    name: '状态管理层',
    icon: '🔗',
    className: 'layer-state',
    tagType: 'warning',
    techs: ['Pinia 3.0.1', 'Vue Router 4.5', 'VueUse 13.1', 'Persistedstate'],
  },
  {
    name: '工具集成层',
    icon: '🛠️',
    className: 'layer-tools',
    tagType: 'error',
    techs: ['Axios 1.9', 'ECharts 5.6', 'AntV X6', 'Vue Flow'],
  },
  {
    name: '开发体验层',
    icon: '🎯',
    className: 'layer-dx',
    tagType: 'default',
    techs: ['ESLint 10', 'Oxlint', 'Vitest', 'Husky'],
  },
]

// 项目核心指标
export const projectMetrics = [
  { number: '54+', label: 'Demo 页面', icon: 'mdi:view-dashboard-outline' },
  { number: '51+', label: '业务组件', icon: 'mdi:puzzle-outline' },
  { number: '8', label: '独立 NPM 包', icon: 'mdi:package-variant-closed' },
  { number: '11', label: 'Vue 指令', icon: 'mdi:code-tags' },
  { number: '4', label: '架构模式', icon: 'mdi:layers-triple-outline' },
  { number: '48+', label: '验证规则', icon: 'mdi:check-circle-outline' },
]

// @robot-admin 生态包
export const ecosystemPackages = [
  {
    shortName: 'naive-ui-components',
    version: '0.8.2',
    icon: 'mdi:puzzle-outline',
    color: '#6366f1',
    desc: '51+ 业务组件，按需导入，主题覆盖',
    url: 'https://www.npmjs.com/package/@robot-admin/naive-ui-components',
  },
  {
    shortName: 'request-core',
    version: '0.1.3',
    icon: 'mdi:api',
    color: '#10b981',
    desc: 'Axios + 7 插件，CRUD Composables',
    url: 'https://www.npmjs.com/package/@robot-admin/request-core',
  },
  {
    shortName: 'layout',
    version: '2.2.0',
    icon: 'mdi:page-layout-sidebar-left',
    color: '#f59e0b',
    desc: '6 种布局模式，设置管理，主题同步',
    url: 'https://www.npmjs.com/package/@robot-admin/layout',
  },
  {
    shortName: 'theme',
    version: '0.1.1',
    icon: 'mdi:palette-outline',
    color: '#ec4899',
    desc: 'Light / Dark / System 主题切换',
    url: 'https://www.npmjs.com/package/@robot-admin/theme',
  },
  {
    shortName: 'directives',
    version: '1.1.0',
    icon: 'mdi:code-tags',
    color: '#8b5cf6',
    desc: '11 个 Vue 指令：copy / watermark 等',
    url: 'https://www.npmjs.com/package/@robot-admin/directives',
  },
  {
    shortName: 'form-validate',
    version: '2.0.0',
    icon: 'mdi:check-decagram-outline',
    color: '#ef4444',
    desc: '48+ 验证规则，中国本地化，Naive UI 适配',
    url: 'https://www.npmjs.com/package/@robot-admin/form-validate',
  },
  {
    shortName: 'file-utils',
    version: '1.0.0',
    icon: 'mdi:file-multiple-outline',
    color: '#06b6d4',
    desc: 'Excel / ZIP / 分片上传，20+ 格式',
    url: 'https://www.npmjs.com/package/@robot-admin/file-utils',
  },
  {
    shortName: 'git-standards',
    version: '1.0.3',
    icon: 'mdi:source-branch',
    color: '#f97316',
    desc: '规范提交 · 中文引导推送',
    url: 'https://www.npmjs.com/package/@robot-admin/git-standards',
  },
]
