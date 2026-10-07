/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\about\data.ts
 * @Description: 关于页技术说明与构建时实际依赖版本
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import projectInfo from 'virtual:robot-admin-project-info'
import type { ProjectDependency } from '@/types/projectInfo'

export interface ProjectItem extends ProjectDependency {
  title: string
  mark: string
}

const descriptions: Record<string, [string, string, string]> = {
  vue: ['Vue', 'V', '渐进式界面框架与组合式 API'],
  'vue-router': ['Vue Router', 'R', '动态路由、导航与访问权限'],
  pinia: ['Pinia', 'P', '用户会话、主题与应用状态'],
  vite: ['Vite', 'Vi', '开发服务与生产构建'],
  typescript: ['TypeScript', 'TS', '静态类型与接口约束'],
  'naive-ui': ['Naive UI', 'N', '主题化基础组件'],
  unocss: ['UnoCSS', 'U', '按需原子样式与图标'],
  '@agile-team/mach-table-vue': ['MachTable Vue', 'M', '企业级虚拟化数据表格'],
  '@robot-admin/naive-ui-components': [
    '业务组件库',
    'UI',
    '通用业务组件、登录表单与功能引导',
  ],
  '@robot-admin/layout': ['布局管理', 'L', '多布局适配与导航壳层'],
  '@robot-admin/request-core': ['请求核心', 'API', '请求、认证与业务接口编排'],
  '@robot-admin/theme': ['主题系统', 'T', '统一亮暗主题与组件主题适配'],
  '@robot-admin/form-validate': ['表单校验', 'F', '表单校验规则与组合校验'],
  '@robot-admin/directives': ['自定义指令', 'D', '权限、复制与水印指令'],
  '@robot-admin/file-utils': ['文件工具', 'File', '文件导出、下载与分片处理'],
  '@robot-admin/git-standards': ['提交规范', 'Git', 'Git 提交约定与工程配置'],
}

/** 将真实依赖与简短场景说明合并，不维护第二份版本号。 */
const toProjectItem = (dependency: ProjectDependency): ProjectItem => {
  const metadata = descriptions[dependency.name]
  return {
    ...dependency,
    title: metadata?.[0] ?? dependency.name,
    mark:
      metadata?.[1] ??
      dependency.name.replace(/^@/, '').slice(0, 2).toUpperCase(),
    description: metadata?.[2] ?? dependency.description,
  }
}

export const applicationVersion = projectInfo.version
export const productionDependencies =
  projectInfo.dependencies.map(toProjectItem)
export const devDependencies = projectInfo.devDependencies.map(toProjectItem)
const allDependencies = [...productionDependencies, ...devDependencies]
export const coreProjects = Object.keys(descriptions).flatMap(name => {
  const dependency = allDependencies.find(item => item.name === name)
  return dependency ? [dependency] : []
})
/** 按职责组织技术清单，与首页的架构介绍和功能入口区分。 */
export const technicalGroups = [
  {
    number: '01',
    title: '基础框架与工程',
    description: '界面、状态、路由与构建工具',
    items: coreProjects.filter(item => !item.name.startsWith('@robot-admin/')),
  },
  {
    number: '02',
    title: 'Robot Admin 生态模块',
    description: '独立包提供基础服务与业务能力',
    items: coreProjects.filter(item => item.name.startsWith('@robot-admin/')),
  },
]
export const ecosystemCount = allDependencies.filter(item =>
  item.name.startsWith('@robot-admin/')
).length
export const componentVersion =
  allDependencies.find(item => item.name === '@robot-admin/naive-ui-components')
    ?.version ?? '—'

/** 技术卡片与依赖表使用同一个搜索条件。 */
export const filterProjects = (
  projects: ProjectItem[],
  keyword: string
): ProjectItem[] => {
  const query = keyword.trim().toLowerCase()
  return projects.filter(item =>
    `${item.title} ${item.name} ${item.description}`
      .toLowerCase()
      .includes(query)
  )
}

/** 表格展示实际安装版本；依赖声明范围放入详情。 */
export const createProjectColumns = (): TableColumn<ProjectItem>[] => [
  { title: '依赖包', key: 'name', minWidth: 260, ellipsis: { tooltip: true } },
  { title: '安装版本', key: 'version', width: 110 },
  {
    title: '应用场景',
    key: 'description',
    minWidth: 280,
    ellipsis: { tooltip: true },
  },
]
