import type { FormRules } from 'naive-ui/es'
import {
  deleteData,
  getData,
  postData,
  putData,
} from '@robot-admin/request-core'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'

// ==================== 类型定义 ====================
export type DictType = 'type' | 'item'

// 基础树节点接口
export interface TreeNodeData {
  id: string
  name: string
  type: DictType
  children?: DictData[]
  [key: string]: unknown
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

export interface ApiResponse<T = unknown> {
  code: string | number
  data: T
  msg: string
}

// ==================== 常量配置 ====================
export const DICT_FORM_RULES: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: ['input', 'blur'] }],
  type: [
    { required: true, message: '请选择类型', trigger: ['change', 'blur'] },
  ],
  typeCode: [
    {
      required: true,
      message: '请输入字典类型编码',
      trigger: ['input', 'blur'],
    },
  ],
  dictLabel: [
    { required: true, message: '请输入字典标签', trigger: ['input', 'blur'] },
  ],
  dictValue: [
    { required: true, message: '请输入字典值', trigger: ['input', 'blur'] },
  ],
  sort: [
    {
      required: true,
      type: 'number',
      message: '请输入排序号',
      trigger: ['input', 'blur'],
    },
  ],
}

export const DICT_STATUS_CONFIGS = [
  {
    field: 'status',
    values: {
      0: { text: '禁用', type: 'error' as const },
      1: { text: '', type: 'success' as const },
    },
  },
]

export const DEFAULT_DICT_FORM_DATA: DictFormData = {
  name: '',
  type: 'type',
  parentId: null,
  code: '',
  value: '',
  sort: 0,
  status: 1,
  remark: '',
  typeCode: '',
  dictLabel: '',
  dictValue: '',
}

// ==================== 模拟数据 ====================
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

// ==================== API 方法 ====================
const cloneDicts = (dicts: DictData[]): DictData[] =>
  dicts.map(dict => ({
    ...dict,
    children: dict.children ? cloneDicts(dict.children) : undefined,
  }))

const findMockDict = (id: string, dicts = MOCK_DICT_DATA): DictData | null => {
  for (const dict of dicts) {
    if (dict.id === id) return dict
    const child = dict.children ? findMockDict(id, dict.children) : null
    if (child) return child
  }
  return null
}

const removeMockDict = (id: string, dicts = MOCK_DICT_DATA): boolean => {
  const index = dicts.findIndex(dict => dict.id === id)
  if (index >= 0) {
    dicts.splice(index, 1)
    return true
  }
  return dicts.some(dict =>
    dict.children ? removeMockDict(id, dict.children) : false
  )
}

export const getDictListApi = async (): Promise<ApiResponse<DictData[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<DictData[]>>('/sys/dictionaries')
  }
  await delayWithSignal(300)
  return { code: '0', data: cloneDicts(MOCK_DICT_DATA), msg: '成功' }
}

export const addDictApi = async (data: DictFormData): Promise<void> => {
  if (!isMockDataMode()) {
    await postData('/sys/dictionaries', data)
    return
  }
  await delayWithSignal(300)
  const id = `dict_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const record: DictData = {
    ...data,
    id,
    children: data.type === 'type' ? [] : undefined,
  }
  if (data.type === 'item') {
    const parent = data.parentId ? findMockDict(data.parentId) : null
    if (!parent || parent.type !== 'type') throw new Error('上级字典不存在')
    parent.children = [...(parent.children || []), record]
  } else {
    MOCK_DICT_DATA.push(record)
  }
}

export const updateDictApi = async (data: DictFormData): Promise<void> => {
  if (!isMockDataMode()) {
    if (!data.id) throw new Error('更新字典缺少 id')
    await putData(`/sys/dictionaries/${data.id}`, data)
    return
  }
  await delayWithSignal(300)
  if (!data.id) throw new Error('更新字典缺少 id')
  const current = findMockDict(data.id)
  if (!current) throw new Error('字典不存在')
  const { children } = current
  Object.assign(current, data, { children })
}

export const deleteDictApi = async (id: string): Promise<void> => {
  if (!isMockDataMode()) {
    await deleteData(`/sys/dictionaries/${id}`)
    return
  }
  await delayWithSignal(250)
  if (!removeMockDict(id)) throw new Error('字典不存在')
}

export const toggleDictStatusApi = async (
  id: string,
  status: number
): Promise<void> => {
  if (!isMockDataMode()) {
    await putData(`/sys/dictionaries/${id}/status`, { status })
    return
  }
  await delayWithSignal(200)
  const current = findMockDict(id)
  if (!current) throw new Error('字典不存在')
  current.status = status
}
