import { NTag, type DataTableColumns } from 'naive-ui/es'
import { h } from 'vue'

// 类型定义
export interface ProjectItem {
  name: string
  bagName: string
  desc: string
  shortDesc?: string // 精简描述（6字以内）
  version: string
  icon: string
  url: string
}

export type VersionType = 'success' | 'info' | 'warning' | 'error'

// 核心依赖数据（有真实logo图片+官网的技术选型）
export const coreProjects: ProjectItem[] = [
  {
    name: 'Vue.js',
    bagName: 'vue',
    desc: '渐进式 JavaScript 框架，用于构建用户界面',
    shortDesc: '渐进式框架',
    version: '^3.5.13',
    icon: 'https://router.vuejs.org/logo.svg',
    url: 'https://vuejs.org/',
  },
  {
    name: 'Vue Router',
    bagName: 'vue-router',
    desc: 'Vue.js 的官方路由管理器',
    shortDesc: '路由管理',
    version: '^4.5.0',
    icon: 'https://router.vuejs.org/logo.svg',
    url: 'https://router.vuejs.org/',
  },
  {
    name: 'Pinia',
    bagName: 'pinia',
    desc: 'Vue.js 的状态管理库，Vuex 的继任者',
    shortDesc: '状态管理',
    version: '^3.0.1',
    icon: 'https://pinia.vuejs.org/logo.svg',
    url: 'https://pinia.vuejs.org/',
  },
  {
    name: 'Vite',
    bagName: 'vite',
    desc: '下一代前端构建工具，快速且现代化',
    shortDesc: '构建工具',
    version: '^6.2.1',
    icon: 'https://vitejs.dev/logo.svg',
    url: 'https://vitejs.dev/',
  },
  {
    name: 'TypeScript',
    bagName: 'typescript',
    desc: 'JavaScript 的超集，添加了静态类型定义',
    shortDesc: '类型系统',
    version: '~5.8.0',
    icon: 'https://www.typescriptlang.org/icons/icon-512x512.png',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Naive UI',
    bagName: 'naive-ui',
    desc: '一个 Vue 3 组件库，主题可调，使用 TypeScript',
    shortDesc: '组件库',
    version: '^2.41.0',
    icon: 'https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg',
    url: 'https://www.naiveui.com/',
  },
  {
    name: 'UnoCSS',
    bagName: 'unocss',
    desc: '即时原子化 CSS 引擎',
    shortDesc: '原子化CSS',
    version: '66.0.0',
    icon: 'https://unocss.dev/logo.svg',
    url: 'https://uno.antfu.me/',
  },
  {
    name: 'ECharts',
    bagName: 'echarts',
    desc: '基于 JavaScript 的开源可视化图表库',
    shortDesc: '图表库',
    version: '^5.6.0',
    icon: 'https://echarts.apache.org/en/images/logo.png',
    url: 'https://echarts.apache.org/',
  },
  {
    name: 'Axios',
    bagName: 'axios',
    desc: '基于 Promise 的 HTTP 客户端',
    shortDesc: 'HTTP客户端',
    version: '^1.9.0',
    icon: 'https://axios-http.com/assets/favicon.ico',
    url: 'https://axios-http.com/',
  },
  {
    name: 'VueUse',
    bagName: '@vueuse/core',
    desc: 'Vue 组合式 API 的工具集合',
    shortDesc: '组合式工具',
    version: '^13.1.0',
    icon: 'https://vueuse.org/favicon.svg',
    url: 'https://vueuse.org/',
  },
  {
    name: 'AntV X6',
    bagName: '@antv/x6',
    desc: '基于 SVG/HTML 的图编辑引擎',
    shortDesc: '图编辑引擎',
    version: '^2.18.1',
    icon: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
    url: 'https://x6.antv.vision/',
  },
  {
    name: 'Sass',
    bagName: 'sass',
    desc: '世界上最成熟、稳定、强大的专业级 CSS 扩展语言',
    shortDesc: 'CSS预处理',
    version: '^1.87.0',
    icon: 'https://logo.svgcdn.com/l/sass.svg',
    url: 'https://sass-lang.com/',
  },
  {
    name: 'ESLint',
    bagName: 'eslint',
    desc: '可插拔的 JavaScript 代码检查工具',
    shortDesc: '代码检查',
    version: '^9.21.0',
    icon: 'https://vectorlogo.zone/logos/eslint/eslint-icon.svg',
    url: 'https://eslint.org/',
  },
  {
    name: 'Prettier',
    bagName: 'prettier',
    desc: '代码格式化工具，支持多种语言',
    shortDesc: '代码格式化',
    version: '3.5.3',
    icon: 'https://prettier.io/icon.png',
    url: 'https://prettier.io/',
  },
  {
    name: 'Vitest',
    bagName: 'vitest',
    desc: '由 Vite 驱动的单元测试框架',
    shortDesc: '单元测试',
    version: '^3.0.8',
    icon: 'https://vitest.dev/logo.svg',
    url: 'https://vitest.dev/',
  },
]

// 生产依赖数据
export const productionDependencies: ProjectItem[] = [
  {
    name: 'Vue.js',
    bagName: 'vue',
    desc: '渐进式 JavaScript 框架，用于构建用户界面',
    version: '^3.5.13',
    icon: 'https://vuejs.org/logo.svg',
    url: 'https://vuejs.org/',
  },
  {
    name: 'Vue Router',
    bagName: 'vue-router',
    desc: 'Vue.js 的官方路由管理器',
    version: '^4.5.0',
    icon: 'https://router.vuejs.org/logo.svg',
    url: 'https://router.vuejs.org/',
  },
  {
    name: 'Pinia',
    bagName: 'pinia',
    desc: 'Vue.js 的状态管理库，Vuex 的继任者',
    version: '^3.0.1',
    icon: 'https://pinia.vuejs.org/logo.svg',
    url: 'https://pinia.vuejs.org/',
  },
  {
    name: 'Pinia 持久化',
    bagName: 'pinia-plugin-persistedstate',
    desc: 'Pinia 状态持久化插件',
    version: '^4.3.0',
    icon: 'https://pinia.vuejs.org/logo.svg',
    url: 'https://prazdevs.github.io/pinia-plugin-persistedstate/',
  },
  {
    name: 'Axios',
    bagName: 'axios',
    desc: '基于 Promise 的 HTTP 客户端',
    version: '^1.9.0',
    icon: 'https://axios-http.com/assets/favicon.ico',
    url: 'https://axios-http.com/',
  },
  {
    name: 'ECharts',
    bagName: 'echarts',
    desc: '基于 JavaScript 的开源可视化图表库',
    version: '^5.6.0',
    icon: 'https://echarts.apache.org/en/images/logo.png',
    url: 'https://echarts.apache.org/',
  },
  {
    name: 'VueUse',
    bagName: '@vueuse/core',
    desc: 'Vue 组合式 API 的工具集合',
    version: '^13.1.0',
    icon: 'https://vueuse.org/favicon.svg',
    url: 'https://vueuse.org/',
  },
  {
    name: 'AntV X6',
    bagName: '@antv/x6',
    desc: '基于 SVG/HTML 的图编辑引擎',
    version: '^2.18.1',
    icon: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
    url: 'https://x6.antv.vision/',
  },
  {
    name: 'CommitLint CLI',
    bagName: '@commitlint/cli',
    desc: 'Git 提交信息规范化工具',
    version: '12.1.4',
    icon: 'https://commitlint.js.org/assets/icon.svg',
    url: 'https://commitlint.js.org/',
  },
  {
    name: 'CommitLint Config',
    bagName: '@commitlint/config-conventional',
    desc: 'CommitLint 传统配置规则',
    version: '12.1.4',
    icon: 'https://commitlint.js.org/assets/icon.svg',
    url: 'https://commitlint.js.org/',
  },
  {
    name: 'FullCalendar Core',
    bagName: '@fullcalendar/core',
    desc: '全功能日历核心库',
    version: '^6.1.17',
    icon: 'https://fullcalendar.io/assets/icon.png',
    url: 'https://fullcalendar.io/',
  },
  {
    name: 'FullCalendar DayGrid',
    bagName: '@fullcalendar/daygrid',
    desc: 'FullCalendar 月视图插件',
    version: '^6.1.17',
    icon: 'https://fullcalendar.io/assets/icon.png',
    url: 'https://fullcalendar.io/',
  },
  {
    name: 'FullCalendar Interaction',
    bagName: '@fullcalendar/interaction',
    desc: 'FullCalendar 交互功能插件',
    version: '^6.1.17',
    icon: 'https://fullcalendar.io/assets/icon.png',
    url: 'https://fullcalendar.io/',
  },
  {
    name: 'FullCalendar List',
    bagName: '@fullcalendar/list',
    desc: 'FullCalendar 列表视图插件',
    version: '^6.1.17',
    icon: 'https://fullcalendar.io/assets/icon.png',
    url: 'https://fullcalendar.io/',
  },
  {
    name: 'FullCalendar Vue3',
    bagName: '@fullcalendar/vue3',
    desc: 'FullCalendar Vue3 适配器',
    version: '^6.1.17',
    icon: 'https://fullcalendar.io/assets/icon.png',
    url: 'https://fullcalendar.io/',
  },
  {
    name: 'Iconify Remix',
    bagName: '@iconify-json/ri',
    desc: 'Iconify Remix 图标集',
    version: '^1.2.5',
    icon: 'https://iconify.design/assets/images/iconify-icon.svg',
    url: 'https://iconify.design/',
  },
  {
    name: 'Iconify Vue',
    bagName: '@iconify/vue',
    desc: 'Iconify Vue 图标组件',
    version: '^5.0.0',
    icon: 'https://iconify.design/assets/images/iconify-icon.svg',
    url: 'https://iconify.design/',
  },
  {
    name: 'Markdown 编辑器',
    bagName: '@kangc/v-md-editor',
    desc: 'Vue3 Markdown 编辑器',
    version: '^2.3.18',
    icon: 'https://ckang1229.gitee.io/vue-md-editor/favicon.ico',
    url: 'https://ckang1229.gitee.io/vue-md-editor/',
  },
  {
    name: 'Spline Runtime',
    bagName: '@splinetool/runtime',
    desc: 'Spline 3D 运行时库',
    version: '^1.9.92',
    icon: 'https://spline.design/favicon.ico',
    url: 'https://spline.design/',
  },
  {
    name: 'Vue Flow',
    bagName: '@vue-flow/core',
    desc: 'Vue3 流程图组件',
    version: '1.45.0',
    icon: 'https://vueflow.dev/favicon.ico',
    url: 'https://vueflow.dev/',
  },
  {
    name: 'Driver.js',
    bagName: 'driver.js',
    desc: '轻量级的用户引导和页面高亮库',
    version: '^1.3.6',
    icon: 'https://driverjs.com/driver.svg',
    url: 'https://driverjs.com/',
  },
  {
    name: 'FileSaver',
    bagName: 'file-saver',
    desc: '客户端文件保存解决方案',
    version: '^2.0.5',
    icon: 'https://github.com/eligrey/FileSaver.js/raw/master/demo/logo.png',
    url: 'https://github.com/eligrey/FileSaver.js',
  },
  {
    name: 'Highlight.js',
    bagName: 'highlight.js',
    desc: '语法高亮库，支持多种编程语言',
    version: '^11.11.1',
    icon: 'https://highlightjs.org/icon.png',
    url: 'https://highlightjs.org/',
  },
  {
    name: 'Html2Canvas',
    bagName: 'html2canvas',
    desc: '将 DOM 元素转换为 Canvas 的库',
    version: '^1.4.1',
    icon: 'https://html2canvas.hertzen.com/favicon.ico',
    url: 'https://html2canvas.hertzen.com/',
  },
  {
    name: 'Husky',
    bagName: 'husky',
    desc: 'Git hooks 工具，用于在 Git 事件中运行脚本',
    version: '7.0.1',
    icon: 'https://typicode.github.io/husky/logo.png',
    url: 'https://typicode.github.io/husky/',
  },
  {
    name: 'JSZip',
    bagName: 'jszip',
    desc: 'JavaScript 创建、读取和编辑 .zip 文件的库',
    version: '^3.10.1',
    icon: 'https://stuk.github.io/jszip/documentation/images/jszip-logo.png',
    url: 'https://stuk.github.io/jszip/',
  },
  {
    name: 'JSZip Utils',
    bagName: 'jszip-utils',
    desc: 'JSZip 工具集',
    version: '^0.1.0',
    icon: 'https://stuk.github.io/jszip/documentation/images/jszip-logo.png',
    url: 'https://github.com/Stuk/jszip-utils',
  },
  {
    name: 'Motion V',
    bagName: 'motion-v',
    desc: 'Vue 3 动画库',
    version: '^1.1.0-alpha.1',
    icon: 'https://motion-v.netlify.app/favicon.ico',
    url: 'https://motion-v.netlify.app/',
  },
  {
    name: 'NProgress',
    bagName: 'nprogress',
    desc: '轻量级的页面加载进度条',
    version: '^0.2.0',
    icon: 'https://ricostacruz.com/nprogress/support/logo.png',
    url: 'https://ricostacruz.com/nprogress/',
  },
  {
    name: 'PrintJS',
    bagName: 'print-js',
    desc: '轻量级的 JavaScript 打印库',
    version: '^1.6.0',
    icon: 'https://printjs.crabbly.com/favicon.ico',
    url: 'https://printjs.crabbly.com/',
  },
  {
    name: 'Vue Draggable Plus',
    bagName: 'vue-draggable-plus',
    desc: 'Vue 3 拖拽组件库',
    version: '^0.6.0',
    icon: 'https://alfred-skyblue.github.io/vue-draggable-plus/favicon.ico',
    url: 'https://alfred-skyblue.github.io/vue-draggable-plus/',
  },
  {
    name: 'WangEditor',
    bagName: 'wangeditor',
    desc: '轻量级 Web 富文本编辑器',
    version: '^4.7.15',
    icon: 'https://www.wangeditor.com/favicon.ico',
    url: 'https://www.wangeditor.com/',
  },
  {
    name: 'SheetJS',
    bagName: 'xlsx',
    desc: 'Excel 电子表格解析和写入库',
    version: '^0.18.5',
    icon: 'https://sheetjs.com/favicon.ico',
    url: 'https://sheetjs.com/',
  },
]

// 开发依赖数据
export const devDependencies: ProjectItem[] = [
  {
    name: 'Vite',
    bagName: 'vite',
    desc: '下一代前端构建工具，快速且现代化',
    version: '^6.2.1',
    icon: 'https://vitejs.dev/logo.svg',
    url: 'https://vitejs.dev/',
  },
  {
    name: 'TypeScript',
    bagName: 'typescript',
    desc: 'JavaScript 的超集，添加了静态类型定义',
    version: '~5.8.0',
    icon: 'https://www.typescriptlang.org/icons/icon-512x512.png',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'ESLint',
    bagName: 'eslint',
    desc: '可插拔的 JavaScript 代码检查工具',
    version: '^9.21.0',
    icon: 'https://eslint.org/assets/img/logo.svg',
    url: 'https://eslint.org/',
  },
  {
    name: 'Prettier',
    bagName: 'prettier',
    desc: '代码格式化工具，支持多种语言',
    version: '3.5.3',
    icon: 'https://prettier.io/icon.png',
    url: 'https://prettier.io/',
  },
  {
    name: 'Vitest',
    bagName: 'vitest',
    desc: '由 Vite 驱动的单元测试框架',
    version: '^3.0.8',
    icon: 'https://vitest.dev/logo.svg',
    url: 'https://vitest.dev/',
  },
  {
    name: 'Sass',
    bagName: 'sass',
    desc: '世界上最成熟、稳定、强大的专业级 CSS 扩展语言',
    version: '^1.87.0',
    icon: 'https://sass-lang.com/assets/img/logos/logo-b6e1ef6e.svg',
    url: 'https://sass-lang.com/',
  },
  {
    name: 'UnoCSS',
    bagName: 'unocss',
    desc: '即时原子化 CSS 引擎',
    version: '66.0.0',
    icon: 'https://unocss.dev/logo.svg',
    url: 'https://uno.antfu.me/',
  },
  {
    name: 'Naive UI',
    bagName: 'naive-ui',
    desc: '一个 Vue 3 组件库，主题可调，使用 TypeScript',
    version: '^2.41.0',
    icon: 'https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg',
    url: 'https://www.naiveui.com/',
  },
  {
    name: 'Oxlint',
    bagName: 'oxlint',
    desc: '用 Rust 编写的快速 JavaScript linter',
    version: '^0.15.13',
    icon: 'https://oxc-project.github.io/logo.svg',
    url: 'https://oxc-project.github.io/',
  },
  {
    name: 'Iconify Material',
    bagName: '@iconify-json/ic',
    desc: 'Iconify Material 图标集',
    version: '^1.2.2',
    icon: 'https://iconify.design/assets/images/iconify-icon.svg',
    url: 'https://iconify.design/',
  },
  {
    name: 'Iconify Line Awesome',
    bagName: '@iconify-json/la',
    desc: 'Iconify Line Awesome 图标集',
    version: '^1.2.1',
    icon: 'https://iconify.design/assets/images/iconify-icon.svg',
    url: 'https://iconify.design/',
  },
  {
    name: 'Iconify MDI',
    bagName: '@iconify-json/mdi',
    desc: 'Iconify Material Design 图标集',
    version: '^1.2.3',
    icon: 'https://iconify.design/assets/images/iconify-icon.svg',
    url: 'https://iconify.design/',
  },
  {
    name: 'Inspira UI Plugins',
    bagName: '@inspira-ui/plugins',
    desc: 'Inspira UI 插件集',
    version: '^0.0.1',
    icon: 'https://inspira-ui.com/favicon.ico',
    url: 'https://inspira-ui.com/',
  },
  {
    name: 'Node.js Types',
    bagName: '@tsconfig/node22',
    desc: 'Node.js 22 TypeScript 配置',
    version: '^22.0.0',
    icon: 'https://nodejs.org/static/images/logo.svg',
    url: 'https://nodejs.org/',
  },
  {
    name: 'FileSaver Types',
    bagName: '@types/file-saver',
    desc: 'FileSaver TypeScript 类型定义',
    version: '^2.0.7',
    icon: 'https://www.typescriptlang.org/icons/icon-512x512.png',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'JSDOM Types',
    bagName: '@types/jsdom',
    desc: 'JSDOM TypeScript 类型定义',
    version: '^21.1.7',
    icon: 'https://www.typescriptlang.org/icons/icon-512x512.png',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Node Types',
    bagName: '@types/node',
    desc: 'Node.js TypeScript 类型定义',
    version: '^22.13.9',
    icon: 'https://www.typescriptlang.org/icons/icon-512x512.png',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'NProgress Types',
    bagName: '@types/nprogress',
    desc: 'NProgress TypeScript 类型定义',
    version: '^0.2.3',
    icon: 'https://www.typescriptlang.org/icons/icon-512x512.png',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Vite Vue Plugin',
    bagName: '@vitejs/plugin-vue',
    desc: 'Vite Vue 3 支持插件',
    version: '^5.2.1',
    icon: 'https://vitejs.dev/logo.svg',
    url: 'https://vitejs.dev/',
  },
  {
    name: 'Vite Vue JSX Plugin',
    bagName: '@vitejs/plugin-vue-jsx',
    desc: 'Vite Vue JSX 支持插件',
    version: '^4.1.1',
    icon: 'https://vitejs.dev/logo.svg',
    url: 'https://vitejs.dev/',
  },
  {
    name: 'Vitest ESLint Plugin',
    bagName: '@vitest/eslint-plugin',
    desc: 'Vitest ESLint 规则插件',
    version: '^1.1.36',
    icon: 'https://vitest.dev/logo.svg',
    url: 'https://vitest.dev/',
  },
  {
    name: 'Vue ESLint Config Prettier',
    bagName: '@vue/eslint-config-prettier',
    desc: 'Vue ESLint Prettier 配置',
    version: '^10.2.0',
    icon: 'https://eslint.org/assets/img/logo.svg',
    url: 'https://eslint.org/',
  },
  {
    name: 'Vue ESLint Config TypeScript',
    bagName: '@vue/eslint-config-typescript',
    desc: 'Vue ESLint TypeScript 配置',
    version: '^14.5.0',
    icon: 'https://eslint.org/assets/img/logo.svg',
    url: 'https://eslint.org/',
  },
  {
    name: 'Vue Runtime Core',
    bagName: '@vue/runtime-core',
    desc: 'Vue 3 运行时核心',
    version: '^3.5.13',
    icon: 'https://vuejs.org/logo.svg',
    url: 'https://vuejs.org/',
  },
  {
    name: 'Vue Test Utils',
    bagName: '@vue/test-utils',
    desc: 'Vue 3 单元测试工具',
    version: '^2.4.6',
    icon: 'https://vuejs.org/logo.svg',
    url: 'https://vuejs.org/',
  },
  {
    name: 'Vue TSConfig',
    bagName: '@vue/tsconfig',
    desc: 'Vue TypeScript 配置',
    version: '^0.7.0',
    icon: 'https://vuejs.org/logo.svg',
    url: 'https://vuejs.org/',
  },
  {
    name: 'Class Variance Authority',
    bagName: 'class-variance-authority',
    desc: 'TypeScript-first 变体 API 构建工具',
    version: '^0.7.1',
    icon: 'https://cva.style/favicon.ico',
    url: 'https://cva.style/',
  },
  {
    name: 'CLSX',
    bagName: 'clsx',
    desc: '用于构造 className 字符串的小型实用程序',
    version: '^2.1.1',
    icon: 'https://github.com/lukeed/clsx/raw/master/logo.png',
    url: 'https://github.com/lukeed/clsx',
  },
  {
    name: 'Commitizen',
    bagName: 'commitizen',
    desc: '规范化 Git 提交信息的工具',
    version: '4.2.4',
    icon: 'https://commitizen.github.io/cz-cli/assets/favicon.ico',
    url: 'https://commitizen.github.io/cz-cli/',
  },
  {
    name: 'CZ Customizable',
    bagName: 'cz-customizable',
    desc: 'Commitizen 自定义适配器',
    version: '6.3.0',
    icon: 'https://commitizen.github.io/cz-cli/assets/favicon.ico',
    url: 'https://github.com/leoforfree/cz-customizable',
  },
  {
    name: 'ESLint JSDoc Plugin',
    bagName: 'eslint-plugin-jsdoc',
    desc: 'ESLint JSDoc 规则插件',
    version: '^50.6.11',
    icon: 'https://eslint.org/assets/img/logo.svg',
    url: 'https://eslint.org/',
  },
  {
    name: 'ESLint Oxlint Plugin',
    bagName: 'eslint-plugin-oxlint',
    desc: 'ESLint Oxlint 集成插件',
    version: '^0.15.13',
    icon: 'https://oxc-project.github.io/logo.svg',
    url: 'https://oxc-project.github.io/',
  },
  {
    name: 'ESLint Vue Plugin',
    bagName: 'eslint-plugin-vue',
    desc: 'ESLint Vue 规则插件',
    version: '~10.0.0',
    icon: 'https://eslint.org/assets/img/logo.svg',
    url: 'https://eslint.vuejs.org/',
  },
  {
    name: 'Jiti',
    bagName: 'jiti',
    desc: 'TypeScript 和 ESM 的运行时 TypeScript 支持',
    version: '^2.4.2',
    icon: 'https://github.com/unjs/jiti/raw/main/logo.svg',
    url: 'https://github.com/unjs/jiti',
  },
  {
    name: 'JSDOM',
    bagName: 'jsdom',
    desc: 'JavaScript 实现的 DOM 和 HTML 标准',
    version: '^26.0.0',
    icon: 'https://github.com/jsdom/jsdom/raw/master/logo.svg',
    url: 'https://github.com/jsdom/jsdom',
  },
  {
    name: 'Lint Staged',
    bagName: 'lint-staged',
    desc: '对 Git 暂存文件运行 linters',
    version: '^15.5.0',
    icon: 'https://github.com/okonet/lint-staged/raw/master/logo.png',
    url: 'https://github.com/okonet/lint-staged',
  },
  {
    name: 'NPM Run All',
    bagName: 'npm-run-all2',
    desc: '并行或顺序运行多个 npm 脚本',
    version: '^7.0.2',
    icon: 'https://github.com/bcomnes/npm-run-all2/raw/master/docs/favicon.ico',
    url: 'https://github.com/bcomnes/npm-run-all2',
  },
  {
    name: 'Unplugin Auto Import',
    bagName: 'unplugin-auto-import',
    desc: '自动导入 APIs 的 Vite/Webpack/Rollup 插件',
    version: '^19.1.2',
    icon: 'https://github.com/antfu/unplugin-auto-import/raw/main/logo.svg',
    url: 'https://github.com/antfu/unplugin-auto-import',
  },
  {
    name: 'Unplugin Icons',
    bagName: 'unplugin-icons',
    desc: '按需访问数千个图标的插件',
    version: '^22.1.0',
    icon: 'https://github.com/antfu/unplugin-icons/raw/main/logo.svg',
    url: 'https://github.com/antfu/unplugin-icons',
  },
  {
    name: 'Unplugin Vue Components',
    bagName: 'unplugin-vue-components',
    desc: 'Vue 组件按需自动导入插件',
    version: '^28.5.0',
    icon: 'https://github.com/antfu/unplugin-vue-components/raw/main/logo.svg',
    url: 'https://github.com/antfu/unplugin-vue-components',
  },
  {
    name: 'Vite Console Plugin',
    bagName: 'vite-console-plugin',
    desc: 'Vite 控制台美化插件',
    version: '^1.0.0',
    icon: 'https://vitejs.dev/logo.svg',
    url: 'https://github.com/vite-plugin/vite-plugin-console',
  },
  {
    name: 'Vite Vue DevTools',
    bagName: 'vite-plugin-vue-devtools',
    desc: 'Vite Vue DevTools 插件',
    version: '^7.7.2',
    icon: 'https://devtools.vuejs.org/logo.svg',
    url: 'https://devtools.vuejs.org/',
  },
  {
    name: 'Vue TSC',
    bagName: 'vue-tsc',
    desc: 'Vue 3 TypeScript 编译器',
    version: '^2.2.8',
    icon: 'https://vuejs.org/logo.svg',
    url: 'https://vuejs.org/',
  },
]

/**
 * 获取版本类型
 * @param version 版本号
 * @returns 版本类型
 */
export function getVersionType(version: string): VersionType {
  if (!version) return 'info'

  // 提取版本号数字部分
  const versionNumber = version.replace(/^[\^~]/, '')

  // 版本号以0开头的用 warning（无论是否带^或~）
  if (versionNumber.startsWith('0')) return 'warning'

  // ^开头的版本用 success
  if (version.startsWith('^')) return 'success'

  // ~开头的版本用 success
  if (version.startsWith('~')) return 'success'

  // 不带标识的版本用 info
  return 'info'
}

/**
 * * @description: 项目表格列配置
 * ! @return {DataTableColumns<ProjectItem>}
 */
export function createProjectColumns(): DataTableColumns<ProjectItem> {
  return [
    { title: '包名', key: 'name', align: 'left' },
    { title: '应用场景', key: 'desc', align: 'left' },
    {
      title: '版本',
      key: 'version',
      align: 'center',
      render: (row: ProjectItem) =>
        h(
          NTag,
          {
            type: getVersionType(row.version),
            size: 'small',
            round: true,
          },
          { default: () => row.version }
        ),
    },
  ]
}

/**
 * * @description: 开发依赖表格列配置
 * ! @return {DataTableColumns<ProjectItem>}
 */
export function createDevColumns(): DataTableColumns<ProjectItem> {
  return [
    { title: '包名', key: 'name', align: 'left' },
    { title: '应用场景', key: 'desc', align: 'left' },
    {
      title: '版本',
      key: 'version',
      align: 'center',
      render: (row: ProjectItem) =>
        h(
          NTag,
          {
            type: getVersionType(row.version),
            size: 'small',
            round: true,
          },
          { default: () => row.version }
        ),
    },
  ]
}
