import type { FormRules } from 'naive-ui/es'

// ==================== 类型定义 ====================
export type DictType = 'type' | 'item'

// 基础树节点接口
export interface TreeNodeData {
  id: string
  name: string
  type: DictType
  children?: DictData[]
  [key: string]: any
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
  code: string
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
export const getDictListApi = async (): Promise<ApiResponse<DictData[]>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: '0', data: MOCK_DICT_DATA, msg: '成功' })
    }, 500)
  })
}

export const addDictApi = async (data: DictFormData): Promise<void> => {
  console.log('添加字典:', data)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const updateDictApi = async (data: DictFormData): Promise<void> => {
  console.log('更新字典:', data)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const deleteDictApi = async (id: string): Promise<void> => {
  console.log('删除字典:', id)
  return new Promise(resolve => setTimeout(resolve, 500))
}

export const toggleDictStatusApi = async (
  id: string,
  status: number
): Promise<void> => {
  console.log('切换字典状态:', id, status)
  return new Promise(resolve => setTimeout(resolve, 300))
}
