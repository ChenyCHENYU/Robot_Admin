/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\useOrderTable.ts
 * @Description: 订单详情、表单选项与本地或远端 CRUD 入口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  defineFormConfig,
  defineFormOptions,
  PRESET_RULES,
} from '@robot-admin/naive-ui-components/C_Form'
import { useDownloadCSV } from '@robot-admin/file-utils'
import {
  createMemoryTableSource,
  defineDetailConfig,
} from '@robot-admin/request-core/vue'
import { request, useAppTableCrud } from '@/plugins/request-core'
import {
  MONEY_FORMATTER,
  ORDER_STATUS,
  REGIONS,
  STATUS_OPTIONS,
  createOrderRows,
  getStatusLabel,
  type OrderRow,
} from './data'

/** 详情展示同样由数据驱动，页面无需重复维护描述列表模板。 */
export const ORDER_DETAIL_CONFIG = defineDetailConfig({
  sections: [
    {
      title: '订单信息',
      columns: 2,
      items: [
        { label: '订单编号', key: 'orderNo' },
        { label: '客户名称', key: 'customer' },
        { label: '产品方案', key: 'product' },
        { label: '区域', key: 'region' },
        { label: '数量', key: 'quantity', type: 'number' },
        {
          label: '订单金额',
          key: 'amount',
          formatter: value => MONEY_FORMATTER.format(Number(value ?? 0)),
        },
        {
          label: '状态',
          key: 'status',
          type: 'tag',
          tagTypes: Object.fromEntries(
            Object.entries(ORDER_STATUS).map(([value, meta]) => [
              value,
              meta.tagType,
            ])
          ),
          formatter: getStatusLabel,
        },
        {
          label: '履约进度',
          key: 'progress',
          formatter: value => `${Number(value ?? 0)}%`,
        },
        { label: '更新时间', key: 'updatedAt', type: 'date' },
      ],
    },
  ],
})

/** 编辑弹窗字段：C_Form 统一负责渲染、双向绑定与校验。 */
export const ORDER_FORM_OPTIONS = defineFormOptions<OrderRow>([
  {
    type: 'input',
    prop: 'orderNo',
    label: '订单编号',
    disabled: true,
  },
  {
    type: 'input',
    prop: 'customer',
    label: '客户名称',
    placeholder: '请输入客户名称',
    rules: [
      PRESET_RULES.required('客户名称'),
      PRESET_RULES.length('客户名称', 2, 30),
    ],
  },
  {
    type: 'input',
    prop: 'product',
    label: '产品方案',
    placeholder: '请输入产品方案',
    rules: [
      PRESET_RULES.required('产品方案'),
      PRESET_RULES.length('产品方案', 2, 40),
    ],
  },
  {
    type: 'select',
    prop: 'region',
    label: '区域',
    placeholder: '请选择区域',
    children: REGIONS.map(value => ({ label: value, value })),
    rules: [PRESET_RULES.required('区域')],
  },
  {
    type: 'inputNumber',
    prop: 'quantity',
    label: '数量',
    attrs: { min: 1, max: 9999 },
    rules: [PRESET_RULES.required('数量'), PRESET_RULES.range('数量', 1, 9999)],
  },
  {
    type: 'inputNumber',
    prop: 'amount',
    label: '订单金额',
    attrs: { min: 0, precision: 0 },
    rules: [
      PRESET_RULES.required('订单金额'),
      PRESET_RULES.range('订单金额', 0, 100_000_000),
    ],
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    children: STATUS_OPTIONS,
    rules: [PRESET_RULES.required('状态')],
  },
  {
    type: 'inputNumber',
    prop: 'progress',
    label: '履约进度',
    attrs: { min: 0, max: 100 },
    rules: [
      PRESET_RULES.required('履约进度'),
      PRESET_RULES.range('履约进度', 0, 100),
    ],
  },
])

/** 编辑弹窗稳定配置；页面只保留一个 C_Form 绑定。 */
export const ORDER_FORM_CONFIG = defineFormConfig<OrderRow>({
  density: 'compact',
  layout: 'grid',
  grid: { cols: 24, xGap: 18 },
  labelPlacement: 'top',
  validateOnChange: false,
})

/**
 * 标准单表接口约定。
 *
 * @description
 * request-core 默认处理 GET 列表/详情、POST 新增、PUT 更新、DELETE 删除；
 * 特殊 HTTP 方法或参数格式只需在 useOrderTable 中覆盖对应 mutation。
 */
export const API_CONFIG = {
  list: '/demo/orders/list',
  export: '/demo/orders/export',
  remove: '/demo/orders/remove/:id',
  get: '/demo/orders/getById/:id',
  create: '/demo/orders/save',
  update: '/demo/orders/update/:id',
}

/** 非标准 CRUD 能力显式扩展：下载细节仍由 file-utils 统一治理。 */
export const exportOrderTable = () =>
  useDownloadCSV(
    (_params, context) =>
      request.get<Blob>(API_CONFIG.export, {
        responseType: 'blob',
        signal: context?.signal,
      }),
    `mach-table-orders-${new Date().toISOString().slice(0, 10)}`
  )

const today = () => new Date().toISOString().slice(0, 10)

const createEmptyOrder = (): OrderRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  orderNo: `MT-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
  customer: '',
  product: '',
  region: REGIONS[0],
  quantity: 1,
  amount: 0,
  status: 'pending',
  progress: 0,
  updatedAt: today(),
})

/**
 * 订单 CRUD 唯一入口：页面不关心请求方法、并发取消、响应提取和刷新时机。
 * mock 模式使用同一能力契约；切换 VITE_DATA_MODE=remote 后直接调用真实端点。
 */
export const useOrderTable = () =>
  useAppTableCrud({
    source:
      import.meta.env.VITE_DATA_MODE === 'remote'
        ? API_CONFIG
        : createMemoryTableSource(createOrderRows),
    defaultPaginationEnabled: false,
    detail: ORDER_DETAIL_CONFIG,
    detailTitle: row => `订单详情 · ${row.orderNo}`,
    editor: {
      createTitle: '新增订单',
      editTitle: row => `编辑订单 · ${row.orderNo}`,
      prepareSubmit: row => ({
        ...row,
        updatedAt: today(),
      }),
    },
    createNewRow: createEmptyOrder,
  })
