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
    label: 'Module Federation',
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

// 核心功能模块
export const coreModules = [
  {
    name: '权限管理',
    icon: '🔐',
    desc: '权限体系，角色、菜单、按钮级权限控制',
    tech: 'Vue Router • Pinia',
  },
  {
    name: '数据看板',
    icon: '📊',
    desc: '可视化图表，实时数据监控和业务分析',
    tech: 'ECharts • FullCalendar',
  },
  {
    name: '表单引擎',
    icon: '📝',
    desc: '动态表单生成，支持8种布局模式配置',
    tech: 'Dynamic Form • Validation',
  },
  {
    name: '工作流引擎',
    icon: '🔄',
    desc: '可视化流程设计，支持审批、通知等业务流程',
    tech: 'Vue Flow • AntV X6',
  },
  {
    name: '组件库',
    icon: '🧩',
    desc: '39+高质量业务组件，独立NPM包发布',
    tech: '@nicecool/naive-ui-components',
  },
  {
    name: '视频播放',
    icon: '🎬',
    desc: '视频播放器组件，支持字幕、快捷键',
    tech: 'Video.js • HLS',
  },
  {
    name: '文件管理',
    icon: '📁',
    desc: '文件上传、预览、导出ZIP、批量下载',
    tech: '@robot-admin/file-utils',
  },
  {
    name: '富文本编辑',
    icon: '✏️',
    desc: '集成多种编辑器，Markdown和富文本',
    tech: 'WangEditor • V-md-editor',
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

// 演示页面列表
export const demoList = [
  { name: '图标组件', icon: '🎨' },
  { name: '地区联动', icon: '🏙️' },
  { name: '进度条', icon: '📊' },
  { name: '时间组件', icon: '⏰' },
  { name: '日期选择', icon: '📅' },
  { name: '城市选择', icon: '🌆' },
  { name: '表单布局', icon: '📝' },
  { name: '表单弹窗', icon: '🪟' },
  { name: '表单搜索', icon: '🔍' },
  { name: '表格组件', icon: '📋' },
  { name: '表格展开', icon: '📂' },
  { name: '动态表格', icon: '🔀' },
  { name: '操作栏', icon: '🎛️' },
  { name: '日历组件', icon: '📆' },
  { name: '代码编辑器', icon: '💻' },
  { name: 'Markdown', icon: '📖' },
  { name: '富文本编辑', icon: '✏️' },
  { name: '导出ZIP', icon: '📦' },
  { name: '复制文本', icon: '📋' },
  { name: '批量下载', icon: '⬇️' },
  { name: '拖拽排序', icon: '🔄' },
  { name: '复制指令', icon: '📄' },
  { name: '水印指令', icon: '💧' },
  { name: '拖拽指令', icon: '👆' },
  { name: '防抖指令', icon: '⏱️' },
  { name: '节流指令', icon: '🚦' },
  { name: '长按指令', icon: '✊' },
  { name: '权限指令', icon: '🔐' },
  { name: '工作流编辑器', icon: '🔄' },
  { name: 'AntV X6', icon: '🕸️' },
  { name: 'Excel操作', icon: '📊' },
  { name: '步骤条', icon: '👣' },
  { name: '文件预览', icon: '👁️' },
  { name: '甘特图', icon: '📐' },
  { name: '成本计算', icon: '💰' },
  { name: '条形码', icon: '▮▮▮' },
  { name: '地图组件', icon: '🗺️' },
  { name: '视频播放', icon: '🎬' },
  { name: '文件上传', icon: '📤' },
  { name: '二维码', icon: '⬛' },
  { name: '电子签名', icon: '✒️' },
  { name: '分割面板', icon: '◫' },
  { name: '折叠面板', icon: '🪗' },
  { name: '图片裁剪', icon: '🖼️' },
  { name: 'Cron表达式', icon: '⏲️' },
  { name: '公式编辑器', icon: '🧮' },
  { name: '瀑布流', icon: '🏞️' },
]

// 核心特性
export const coreFeatures = [
  {
    name: 'RBAC权限系统',
    icon: '🔒',
    desc: '完整的角色权限管理，支持菜单、按钮级别控制',
  },
  {
    name: '主题定制',
    icon: '🎨',
    desc: '支持深色/浅色主题，可自定义品牌色彩',
  },
  {
    name: '响应式设计',
    icon: '📱',
    desc: '完美适配桌面端、平板、手机等设备',
  },
  { name: '高性能', icon: '⚡', desc: '基于Vite 7构建，支持热更新和代码分割' },
  { name: '组件库', icon: '🧩', desc: '39+高质量业务组件，独立NPM包发布' },
  { name: 'TypeScript', icon: '🔧', desc: '完整的类型定义，提升开发体验' },
  {
    name: '多架构支持',
    icon: '🏗️',
    desc: '单体/Monorepo/MFE/微前端，四种架构已验证',
  },
  {
    name: '国际化',
    icon: '🌍',
    desc: '内置中/英/日三语言切换，路由级翻译',
  },
]

// 开发工具分类
export const toolCategories = [
  {
    name: '代码质量',
    type: 'info',
    tools: ['ESLint 10', 'Oxlint', 'TypeScript 5.8', 'cspell'],
  },
  {
    name: '构建部署',
    type: 'success',
    tools: ['Vite 7', 'Bun', 'tsdown', 'Vercel'],
  },
  {
    name: '提交规范',
    type: 'warning',
    tools: ['Husky', 'Commitizen', 'lint-staged', 'Release-Please'],
  },
]

// 快速开始步骤
export const quickSteps = [
  {
    title: '克隆项目',
    code: 'git clone https://github.com/ChenyCHENYU/robot-admin.git',
  },
  { title: '安装依赖', code: 'bun install' },
  { title: '启动项目', code: 'bun run dev' },
]

// 文件树数据结构
export interface TreeNode {
  name: string
  type: 'folder' | 'file'
  desc?: string
  icon?: string
  children?: TreeNode[]
}

// 项目结构数据 - 替代原来 200+ 行的硬编码标签
export const projectStructure: TreeNode = {
  name: 'Robot_Admin/',
  type: 'folder',
  icon: '📁',
  children: [
    {
      name: 'src/',
      type: 'folder',
      icon: '📁',
      desc: '源代码目录',
      children: [
        {
          name: 'api/',
          type: 'folder',
          icon: '📁',
          desc: '接口管理层',
        },
        {
          name: 'components/',
          type: 'folder',
          icon: '📁',
          desc: '桥接层组件（封装 @nicecool/naive-ui-components）',
          children: [
            {
              name: 'global/',
              type: 'folder',
              icon: '📁',
              desc: '全局桥接组件',
            },
            {
              name: 'local/',
              type: 'folder',
              icon: '📁',
              desc: '局部组件',
            },
          ],
        },
        {
          name: 'views/',
          type: 'folder',
          icon: '📁',
          desc: '页面视图',
          children: [
            {
              name: 'dashboard/',
              type: 'folder',
              icon: '📁',
              desc: '仪表盘',
              children: [
                {
                  name: 'analysis/',
                  type: 'folder',
                  icon: '📁',
                  desc: '数据分析',
                },
                {
                  name: 'statistics/',
                  type: 'folder',
                  icon: '📁',
                  desc: '统计报表',
                },
              ],
            },
            {
              name: 'demo/',
              type: 'folder',
              icon: '📁',
              desc: '47个演示页面',
              children: [
                {
                  name: '01-icon/ ~ 12-table-dynamic/',
                  type: 'folder',
                  icon: '📁',
                  desc: '基础组件演示',
                },
                {
                  name: '13-calendar/ ~ 16-text-editor/',
                  type: 'folder',
                  icon: '📁',
                  desc: '编辑器 & 日历',
                },
                {
                  name: '17-export-zip/ ~ 20-dragable/',
                  type: 'folder',
                  icon: '📁',
                  desc: '文件操作 & 拖拽',
                },
                {
                  name: '21-copy-direct/ ~ 27-permission-direct/',
                  type: 'folder',
                  icon: '📁',
                  desc: '7个自定义指令',
                },
                {
                  name: '28-work-flow/ ~ 48-waterfall/',
                  type: 'folder',
                  icon: '📁',
                  desc: '高级业务组件',
                },
              ],
            },
            {
              name: 'preview/',
              type: 'folder',
              icon: '📁',
              desc: '组件预览（文档站 iframe 嵌入）',
            },
            {
              name: 'sys-manage/',
              type: 'folder',
              icon: '📁',
              desc: '系统管理',
              children: [
                {
                  name: 'user-manage/',
                  type: 'folder',
                  icon: '📁',
                  desc: '用户管理',
                },
                {
                  name: 'role-manage/',
                  type: 'folder',
                  icon: '📁',
                  desc: '角色管理',
                },
                {
                  name: 'menu-manage/',
                  type: 'folder',
                  icon: '📁',
                  desc: '菜单管理',
                },
              ],
            },
            { name: 'login/', type: 'folder', icon: '📁', desc: '登录页面' },
            { name: 'home/', type: 'folder', icon: '📁', desc: '项目主页' },
          ],
        },
        {
          name: 'config/',
          type: 'folder',
          icon: '📁',
          desc: 'Vite插件 & 构建配置',
        },
        {
          name: 'stores/',
          type: 'folder',
          icon: '📁',
          desc: '状态管理',
          children: [
            { name: 'app/', type: 'folder', icon: '📁', desc: '应用状态' },
            { name: 'user/', type: 'folder', icon: '📁', desc: '用户状态' },
            {
              name: 'permission/',
              type: 'folder',
              icon: '📁',
              desc: '权限状态',
            },
            { name: 'theme/', type: 'folder', icon: '📁', desc: '主题状态' },
          ],
        },
        {
          name: 'composables/',
          type: 'folder',
          icon: '📁',
          desc: '组合式API',
          children: [
            { name: 'Form/', type: 'folder', icon: '📁', desc: '表单组合' },
            { name: 'Table/', type: 'folder', icon: '📁', desc: '表格组合' },
          ],
        },
        {
          name: 'hooks/',
          type: 'folder',
          icon: '📁',
          desc: '自定义Hook',
        },
        {
          name: 'router/',
          type: 'folder',
          icon: '📁',
          desc: '路由配置（含 previewRouter）',
        },
        { name: 'utils/', type: 'folder', icon: '📁', desc: '工具函数' },
        { name: 'types/', type: 'folder', icon: '📁', desc: '类型定义' },
        {
          name: 'plugins/',
          type: 'folder',
          icon: '📁',
          desc: '插件配置',
        },
        { name: 'assets/', type: 'folder', icon: '📁', desc: '静态资源' },
        { name: 'main.ts', type: 'file', icon: '📄', desc: '应用入口' },
        { name: 'App.vue', type: 'file', icon: '📄', desc: '根组件' },
      ],
    },
    { name: 'envs/', type: 'folder', icon: '📁', desc: '多环境变量配置' },
    {
      name: 'lang/',
      type: 'folder',
      icon: '📁',
      desc: '国际化资源（中/英/日）',
    },
    { name: 'scripts/', type: 'folder', icon: '📁', desc: '构建 & 部署脚本' },
    { name: 'public/', type: 'folder', icon: '📁', desc: '静态资源' },
    { name: 'vite.config.ts', type: 'file', icon: '📄', desc: 'Vite 7 配置' },
    { name: 'unocss.config.ts', type: 'file', icon: '📄', desc: 'UnoCSS配置' },
    {
      name: 'vercel.json',
      type: 'file',
      icon: '📄',
      desc: 'Vercel部署 & CORS配置',
    },
    { name: 'package.json', type: 'file', icon: '📄', desc: '项目配置' },
    { name: 'tsconfig.json', type: 'file', icon: '📄', desc: 'TS配置' },
    {
      name: 'eslint.config.ts',
      type: 'file',
      icon: '📄',
      desc: 'ESLint Flat配置',
    },
    { name: 'README.md', type: 'file', icon: '📄', desc: '项目说明' },
  ],
}
