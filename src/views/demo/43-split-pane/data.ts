/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-09 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-09 20:51:05
 * @FilePath: \naive-ui-componentsd:\project\robot\Robot_Admin\src\views\demo\43-split-pane\data.ts
 * @Description: 分割面板演示页数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/** 演示面板样式 colorClass 枚举 */
export type PanelColorClass =
  | 'demo-panel--primary'
  | 'demo-panel--info'
  | 'demo-panel--success'
  | 'demo-panel--warning'
  | 'demo-panel--disabled'

/** 演示面板配置 */
export interface PanelConfig {
  icon: string
  label: string
  colorClass: PanelColorClass
}

/** 演示区域元数据 */
export interface SectionMeta {
  titleIcon: string
  title: string
  /** 支持 <code> 等行内 HTML，模板中使用 v-html 渲染 */
  descHtml: string
}

/** 各 section 元数据 */
export const SECTIONS: Record<string, SectionMeta> = {
  basic: {
    titleIcon: 'mdi:arrow-split-vertical',
    title: '基础水平分割',
    descHtml: '最简单的左右分割面板，可拖拽分割线调整面板大小',
  },
  vertical: {
    titleIcon: 'mdi:arrow-split-horizontal',
    title: '垂直分割',
    descHtml: '设置 <code>direction="vertical"</code> 可切换为上下分割',
  },
  limits: {
    titleIcon: 'mdi:arrow-expand-horizontal',
    title: '尺寸限制',
    descHtml:
      '通过 <code>min-size</code> 和 <code>max-size</code> 限制面板的最小/最大比例',
  },
  collapse: {
    titleIcon: 'mdi:unfold-more-vertical',
    title: '折叠 / 展开',
    descHtml: '双击分割线或点击折叠按钮可折叠面板。也可以通过编程方式控制折叠',
  },
  nested: {
    titleIcon: 'mdi:view-column-outline',
    title: '嵌套分割',
    descHtml: 'SplitPane 可互相嵌套，实现复杂的编辑器布局',
  },
  keyboard: {
    titleIcon: 'mdi:keyboard',
    title: '键盘控制',
    descHtml:
      '聚焦分割线后，可用 <code>←</code> <code>→</code> 方向键微调面板大小，<code>Home</code> / <code>End</code> 跳到最小/最大值',
  },
  disabled: {
    titleIcon: 'mdi:lock-outline',
    title: '禁用状态',
    descHtml: '设置 <code>disabled</code> 后分割线不可拖拽',
  },
}

/** 各 section 的面板内容配置 */
export const PANELS: Record<string, PanelConfig> = {
  // 基础水平分割
  basicFirst: {
    icon: 'mdi:dock-left',
    label: '左面板',
    colorClass: 'demo-panel--primary',
  },
  basicSecond: {
    icon: 'mdi:dock-right',
    label: '右面板',
    colorClass: 'demo-panel--info',
  },
  // 垂直分割
  vertFirst: {
    icon: 'mdi:dock-top',
    label: '上面板',
    colorClass: 'demo-panel--success',
  },
  vertSecond: {
    icon: 'mdi:dock-bottom',
    label: '下面板',
    colorClass: 'demo-panel--warning',
  },
  // 尺寸限制
  limitsFirst: {
    icon: 'mdi:arrow-collapse-left',
    label: '最小 20%',
    colorClass: 'demo-panel--primary',
  },
  limitsSecond: {
    icon: 'mdi:arrow-collapse-right',
    label: '最大 80%',
    colorClass: 'demo-panel--info',
  },
  // 折叠/展开
  collapseFirst: {
    icon: 'mdi:page-layout-sidebar-left',
    label: '侧边栏',
    colorClass: 'demo-panel--success',
  },
  collapseSecond: {
    icon: 'mdi:page-layout-body',
    label: '主内容区',
    colorClass: 'demo-panel--warning',
  },
  // 嵌套分割
  nestedFileTree: {
    icon: 'mdi:folder-outline',
    label: '文件树',
    colorClass: 'demo-panel--primary',
  },
  nestedEditor: {
    icon: 'mdi:code-braces',
    label: '代码编辑区',
    colorClass: 'demo-panel--info',
  },
  nestedTerminal: {
    icon: 'mdi:console',
    label: '终端 / 输出',
    colorClass: 'demo-panel--warning',
  },
  // 键盘控制
  keyboardFirst: {
    icon: 'mdi:keyboard-outline',
    label: '点击分割线后按方向键',
    colorClass: 'demo-panel--primary',
  },
  keyboardSecond: {
    icon: 'mdi:arrow-left-right',
    label: '步长 5%',
    colorClass: 'demo-panel--info',
  },
  // 禁用状态
  disabledPanel: {
    icon: 'mdi:lock',
    label: '锁定面板',
    colorClass: 'demo-panel--disabled',
  },
}
