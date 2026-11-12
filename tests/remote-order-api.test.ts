/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\remote-order-api.test.ts
 * @Description: 本地远程订单接口的取消、分页、原码与动态字段边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  createRemoteOrderDemoApi,
  DEFAULT_FAULTS,
  readDetailSnapshot,
  toDetailPage,
  toOrderPage,
} from '../src/views/production-sales/remote-workbench/api'

/** 每个用例建立独立接口实例，不能共享一次性故障或本地草稿。 */
function setup() {
  const faults = { ...DEFAULT_FAULTS }
  return {
    faults,
    api: createRemoteOrderDemoApi(faults),
    signal: new AbortController().signal,
  }
}

test('服务端查询保留 status=0 / urgent=false；页码和排序都在接口生效', async () => {
  const { api, signal } = setup()
  const first = toOrderPage(
    await api.getOrdersApi({
      page: 1,
      pageSize: 2,
      signal,
      query: { keyword: '', status: 0, urgent: false },
      sortModel: [{ colId: 'weight', direction: 'desc' }],
    })
  )
  expect(first.total).toBe(4)
  expect(first.rows.map(row => row.id)).toEqual(['RO-10', 'RO-4'])
  expect(
    first.rows.every(row => row.status === 0 && row.urgent === false)
  ).toBe(true)
  const second = toOrderPage(
    await api.getOrdersApi({
      page: 2,
      pageSize: 2,
      signal,
      query: { keyword: '', status: 0, urgent: false },
      sortModel: [{ colId: 'weight', direction: 'desc' }],
    })
  )
  expect(second.rows.map(row => row.id)).toEqual(['RO-1', 'RO-13'])
})

test('公开 SortModel 的 direction 升降序与多列次序均真实生效', async () => {
  const { api, signal } = setup()
  const params = {
    page: 1,
    pageSize: 13,
    signal,
    query: { keyword: '', status: null, urgent: null },
  }
  const asc = toOrderPage(
    await api.getOrdersApi({
      ...params,
      sortModel: [{ colId: 'weight', direction: 'asc' }],
    })
  )
  const desc = toOrderPage(
    await api.getOrdersApi({
      ...params,
      sortModel: [{ colId: 'weight', direction: 'desc' }],
    })
  )
  expect(asc.rows[0].id).toBe('RO-13')
  expect(desc.rows[0].id).toBe('RO-12')
  expect(desc.rows.map(row => row.id)).toEqual(
    [...asc.rows].reverse().map(row => row.id)
  )
  const multiple = toOrderPage(
    await api.getOrdersApi({
      ...params,
      sortModel: [
        { colId: 'status', direction: 'asc' },
        { colId: 'weight', direction: 'desc' },
      ],
    })
  )
  expect(multiple.rows.slice(0, 5).map(row => row.id)).toEqual([
    'RO-10',
    'RO-7',
    'RO-4',
    'RO-1',
    'RO-13',
  ])
  expect(multiple.rows.slice(0, 5).every(row => row.status === 0)).toBe(true)
})

test('动态字段和行来自同一快照，零重量与 false 原码不丢失，空页仍返回字段', async () => {
  const { api, signal } = setup()
  const result = toDetailPage(
    await api.getOrderLinesApi({
      page: 1,
      pageSize: 4,
      signal,
      query: { orderId: 'RO-1', variant: 'quality' },
    })
  )
  expect(result.rows[0].quantity).toBe(0)
  expect(result.rows[0].urgent).toBe(false)
  expect(result.columns.some(field => field.key === 'inspectionNo')).toBe(true)
  expect(result.columns.some(field => field.key === 'warehouse')).toBe(false)
  expect(readDetailSnapshot(result)).toBe(result)
  const empty = toDetailPage(
    await api.getOrderLinesApi({
      page: 1,
      pageSize: 4,
      signal,
      query: { orderId: 'RO-13', variant: 'delivery' },
    })
  )
  expect(empty.rows).toEqual([])
  expect(empty.total).toBe(0)
  expect(empty.columns.some(field => field.key === 'warehouse')).toBe(true)
})

test('坏字段元数据在 request 边界拒绝，不允许进入 query 提交行数据', () => {
  const envelope = {
    code: 0,
    data: {
      records: [],
      total: 0,
      fields: [{ key: 'product' as const, title: '' }],
      variant: 'delivery' as const,
    },
  }
  expect(() => toDetailPage(envelope)).toThrow('字段配置无效')
  envelope.data.fields = [
    { key: 'product', title: '产品' },
    { key: 'product', title: '重复产品' },
  ]
  expect(() => toDetailPage(envelope)).toThrow('重复')
})

test('接口遵守取消，失败只消费一次，两个页面实例不会互相污染', async () => {
  const first = setup()
  const second = setup()
  const controller = new AbortController()
  const pending = first.api.getOrderLinesApi({
    page: 1,
    pageSize: 4,
    signal: controller.signal,
    query: { orderId: 'RO-1', variant: 'delivery' },
  })
  controller.abort()
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  first.faults.failNextOrders = true
  const params = {
    page: 1,
    pageSize: 2,
    signal: first.signal,
    query: { keyword: '', status: null, urgent: null },
  }
  await expect(first.api.getOrdersApi(params)).rejects.toThrow('订单查询')
  expect((await first.api.getOrdersApi(params)).data.records).toHaveLength(2)
  expect(second.api.stats.orders).toBe(0)
  await first.api.saveOrderDraftApi(
    'RO-1',
    { owner: '本地修改', urgent: false, note: '' },
    first.signal
  )
  expect((await second.api.getOrdersApi(params)).data.records[0].owner).toBe(
    '陈雨'
  )
})

test('删除遵守取消和待下达状态，末页移除后返回真实 total 供 query 回退', async () => {
  const { api, signal } = setup()
  const controller = new AbortController()
  const cancelled = api.removeOrderApi('RO-13', controller.signal)
  controller.abort()
  await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' })
  await expect(api.removeOrderApi('RO-2', signal)).rejects.toThrow('待下达')
  const params = {
    page: 3,
    pageSize: 6,
    signal,
    query: { keyword: '', status: null, urgent: null },
  }
  expect(toOrderPage(await api.getOrdersApi(params)).rows[0].id).toBe('RO-13')
  await api.removeOrderApi('RO-13', signal)
  const removed = toOrderPage(await api.getOrdersApi(params))
  expect(removed.total).toBe(12)
  expect(removed.rows).toEqual([])
  expect(
    toOrderPage(await api.getOrdersApi({ ...params, page: 2 })).rows
  ).toHaveLength(6)
})
