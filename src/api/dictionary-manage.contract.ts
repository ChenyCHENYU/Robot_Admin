/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\dictionary-manage.contract.ts
 * @Description: 字典类型、字典项与编辑草稿的显式领域契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export type DictType = 'type' | 'item'

// 基础树节点接口
export interface TreeNodeData {
  id: string
  name: string
  type: DictType
  children?: DictData[]
}

// 字典数据接口
export interface DictData extends TreeNodeData {
  parentId?: string | null
  code: string
  value?: string
  sort: number
  status: number
  remark?: string
  children?: DictData[]
  // 字典类型特有字段
  typeCode?: string
  // 字典项特有字段
  dictLabel?: string
  dictValue?: string
}

export interface DictFormData {
  id?: string
  name: string
  type: DictType
  parentId: string | null
  code: string
  value: string
  sort: number
  status: number
  remark: string
  typeCode: string
  dictLabel: string
  dictValue: string
}
