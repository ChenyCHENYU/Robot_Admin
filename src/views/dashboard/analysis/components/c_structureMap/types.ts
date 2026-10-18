/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 工程结构图的分类与明细契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export interface StructureNode {
  key: string
  label: string
  count: number
  note: string
  children: Array<{ label: string; detail: string }>
}
