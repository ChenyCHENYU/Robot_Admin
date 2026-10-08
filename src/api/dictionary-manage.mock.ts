/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\dictionary-manage.mock.ts
 * @Description: 字典演示状态与树操作，返回列表与草稿互不共享引用
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DictData } from './dictionary-manage.contract'

export const MOCK_DICT_DATA: DictData[] = [
  {
    id: 'user_status',
    name: '用户状态',
    type: 'type',
    parentId: null,
    code: 'user_status',
    typeCode: 'user_status',
    sort: 1,
    status: 1,
    remark: '用户状态字典',
    children: [
      {
        id: 'user_status_1',
        name: '正常',
        type: 'item',
        parentId: 'user_status',
        code: 'normal',
        value: '1',
        dictLabel: '正常',
        dictValue: '1',
        sort: 1,
        status: 1,
        remark: '用户状态正常',
      },
      {
        id: 'user_status_2',
        name: '禁用',
        type: 'item',
        parentId: 'user_status',
        code: 'disabled',
        value: '0',
        dictLabel: '禁用',
        dictValue: '0',
        sort: 2,
        status: 0,
        remark: '用户状态禁用',
      },
    ],
  },
  {
    id: 'gender',
    name: '性别',
    type: 'type',
    parentId: null,
    code: 'gender',
    typeCode: 'gender',
    sort: 2,
    status: 0, // 设置为禁用状态，用于演示
    remark: '性别字典',
    children: [
      {
        id: 'gender_1',
        name: '男',
        type: 'item',
        parentId: 'gender',
        code: 'male',
        value: '1',
        dictLabel: '男',
        dictValue: '1',
        sort: 1,
        status: 1,
        remark: '男性',
      },
      {
        id: 'gender_2',
        name: '女',
        type: 'item',
        parentId: 'gender',
        code: 'female',
        value: '0',
        dictLabel: '女',
        dictValue: '0',
        sort: 2,
        status: 1,
        remark: '女性',
      },
    ],
  },
]

/** 递归复制字典列表，隔离未保存的列表编辑。 */
export const cloneDicts = (dicts: DictData[]): DictData[] =>
  dicts.map(dict => ({
    ...dict,
    children: dict.children ? cloneDicts(dict.children) : undefined,
  }))

/** 从演示树中查找可写字典节点。 */
export const findMockDict = (
  id: string,
  dicts = MOCK_DICT_DATA
): DictData | null => {
  for (const dict of dicts) {
    if (dict.id === id) return dict
    const child = dict.children ? findMockDict(id, dict.children) : null
    if (child) return child
  }
  return null
}

/** 删除字典节点及其子项，返回是否实际删除。 */
export const removeMockDict = (id: string, dicts = MOCK_DICT_DATA): boolean => {
  const index = dicts.findIndex(dict => dict.id === id)
  if (index >= 0) {
    dicts.splice(index, 1)
    return true
  }
  return dicts.some(dict =>
    dict.children ? removeMockDict(id, dict.children) : false
  )
}
