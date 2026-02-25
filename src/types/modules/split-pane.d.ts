/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\split-pane.d.ts
 * @Description: 分割面板组件类型定义
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/** 分割方向 */
export type SplitDirection = 'horizontal' | 'vertical'

/** 面板折叠方向 */
export type CollapseTarget = 'first' | 'second'

/** 面板信息 */
export interface PanelInfo {
  /** 当前面板大小百分比 0-100 */
  size: number
  /** 面板是否已折叠 */
  collapsed: boolean
}

/** 组件 Props */
export interface SplitPaneProps {
  /** 分割方向 */
  direction?: SplitDirection
  /** 首面板默认大小（百分比 0-100） */
  defaultSize?: number
  /** 首面板最小大小（百分比 0-100） */
  minSize?: number
  /** 首面板最大大小（百分比 0-100） */
  maxSize?: number
  /** 是否禁用拖拽调整 */
  disabled?: boolean
  /** 是否可折叠 */
  collapsible?: boolean
  /** 是否显示折叠按钮 */
  showCollapseButton?: boolean
  /** 分割线宽度（px） */
  gutterSize?: number
  /** 键盘微调步长（百分比） */
  step?: number
}

/** 组件暴露方法 */
export interface SplitPaneExpose {
  /** 折叠面板 */
  collapse: (target?: CollapseTarget) => void
  /** 展开面板 */
  expand: () => void
  /** 切换折叠/展开 */
  toggle: (target?: CollapseTarget) => void
  /** 重置为默认大小 */
  resetSize: () => void
  /** 获取当前面板信息 */
  getPanelInfo: () => { first: PanelInfo; second: PanelInfo }
  /** 设置面板大小（百分比 0-100） */
  setSize: (size: number) => void
}

/** 组件事件 */
export interface SplitPaneEmits {
  /** 面板大小变化 */
  resize: [firstSize: number, secondSize: number]
  /** 面板折叠 */
  collapse: [target: CollapseTarget]
  /** 面板展开 */
  expand: [target: CollapseTarget]
  /** 开始拖拽 */
  'drag-start': [size: number]
  /** 结束拖拽 */
  'drag-end': [size: number]
}
