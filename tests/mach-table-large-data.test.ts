/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\tests\mach-table-large-data.test.ts
 * @Description: 超大数据按需生成与模拟传输取消生命周期回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, mock, test } from 'bun:test'
import type { InfiniteGetRowsParams } from '@agile-team/mach-table-vue'
import {
  createLargeDataSource,
  createLargeRows,
  LARGE_BLOCK_SIZE,
  LARGE_COLUMNS,
  LARGE_ROW_COUNT,
  normalizeLargeRow,
  type LargeDataRow,
} from '../src/views/demo/57-mach-table/components/c_largeData/data'

/** 构造单个表格请求，不启动 DOM、浏览器或真实后端。 */
function request(
  signal = new AbortController().signal
): InfiniteGetRowsParams<LargeDataRow> {
  return {
    startRow: 9_999_980,
    endRow: LARGE_ROW_COUNT,
    sortModel: [],
    filterModel: {},
    advancedFilterModel: null,
    quickFilterText: null,
    signal,
    onSuccess: mock(() => {}),
    fail: mock(() => {}),
  }
}
/** 等待超过固定模拟延迟，确认取消后不会迟到成功。 */
const tick = () => new Promise<void>(resolve => setTimeout(resolve, 20))

describe('千万行演示的有限数据生成', () => {
  test('按绝对位置生成首末行，并保持跨块重取的稳定身份', () => {
    expect(createLargeRows(0, 1)[0]).toMatchObject({
      id: 'large-1',
      sequence: 1,
      orderNo: 'ML-00000001',
    })
    const last = createLargeRows(LARGE_ROW_COUNT - 1, LARGE_ROW_COUNT)
    expect(last).toHaveLength(1)
    expect(last[0]).toMatchObject({
      id: 'large-10000000',
      sequence: LARGE_ROW_COUNT,
      orderNo: 'ML-10000000',
    })
    expect(createLargeRows(321, 325)).toEqual(
      createLargeRows(300, 400).slice(21, 25)
    )
  })
  test('异常或超大范围也不会创建全量数组，列模型只持有有限定义', () => {
    expect(createLargeRows(0, Number.MAX_SAFE_INTEGER)).toHaveLength(
      LARGE_BLOCK_SIZE
    )
    expect(createLargeRows(LARGE_ROW_COUNT, LARGE_ROW_COUNT + 200)).toEqual([])
    for (const value of [NaN, Infinity, -Infinity])
      expect(createLargeRows(value, 200)).toEqual([])
    expect(createLargeRows(5, 2)).toEqual([])
    expect(LARGE_COLUMNS.filter(column => !column.pinned)).toHaveLength(46)
    expect(
      LARGE_COLUMNS.filter(column => column.pinned === 'left')
    ).toHaveLength(2)
    expect(
      LARGE_COLUMNS.filter(column => column.pinned === 'right')
    ).toHaveLength(1)
  })
  test('1 基输入归一化不越界，空值不意外跳至首行', () => {
    expect(normalizeLargeRow(5_000_000)).toBe(5_000_000)
    expect(normalizeLargeRow(9.9)).toBe(9)
    expect(normalizeLargeRow(-4)).toBe(1)
    expect(normalizeLargeRow(Number.MAX_SAFE_INTEGER)).toBe(LARGE_ROW_COUNT)
    expect(normalizeLargeRow(null)).toBeNull()
    expect(normalizeLargeRow(NaN)).toBeNull()
  })
})

describe('模拟传输资源边界', () => {
  test('成功请求回传真实总数，并先释放自身资源', async () => {
    const source = createLargeDataSource(),
      params = request()
    params.onSuccess = mock((rows, total) => {
      expect(source.pendingCount).toBe(0)
      expect(rows.at(-1)?.sequence).toBe(LARGE_ROW_COUNT)
      expect(total).toBe(LARGE_ROW_COUNT)
    })
    source.datasource.getRows(params)
    expect(source.pendingCount).toBe(1)
    await tick()
    expect(params.onSuccess).toHaveBeenCalledTimes(1)
    expect(params.fail).not.toHaveBeenCalled()
    source.dispose()
  })
  test('已经取消与请求中取消均不迟到安装数据', async () => {
    const source = createLargeDataSource(),
      controller = new AbortController()
    const params = request(controller.signal)
    source.datasource.getRows(params)
    controller.abort(new Error('由宿主取消'))
    expect(source.pendingCount).toBe(0)
    expect(params.fail).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'AbortError' })
    )
    const cancelled = request(controller.signal)
    source.datasource.getRows(cancelled)
    expect(source.pendingCount).toBe(0)
    await tick()
    expect(params.onSuccess).not.toHaveBeenCalled()
    expect(cancelled.onSuccess).not.toHaveBeenCalled()
    expect(cancelled.fail).toHaveBeenCalledTimes(1)
    source.dispose()
  })
  test('停用清理所有请求且隔离另一实例，恢复可重取，销毁不可恢复', async () => {
    const first = createLargeDataSource(),
      second = createLargeDataSource()
    const a = request(),
      b = request(),
      independent = request()
    first.datasource.getRows(a)
    first.datasource.getRows(b)
    second.datasource.getRows(independent)
    first.pause()
    expect(first.pendingCount).toBe(0)
    expect(a.fail).toHaveBeenCalledTimes(1)
    expect(b.fail).toHaveBeenCalledTimes(1)
    expect(second.pendingCount).toBe(1)
    first.resume()
    const resumed = request()
    first.datasource.getRows(resumed)
    await tick()
    expect(resumed.onSuccess).toHaveBeenCalledTimes(1)
    expect(independent.onSuccess).toHaveBeenCalledTimes(1)
    first.dispose()
    first.resume()
    const disposed = request()
    first.datasource.getRows(disposed)
    expect(disposed.fail).toHaveBeenCalledTimes(1)
    expect(first.pendingCount).toBe(0)
    second.dispose()
  })
  test('取消回调重入时已经关闭入口，卸载不会遗留新计时器', async () => {
    const source = createLargeDataSource(),
      params = request(),
      nested = request()
    params.fail = mock(() => source.datasource.getRows(nested))
    source.datasource.getRows(params)
    source.dispose()
    expect(source.pendingCount).toBe(0)
    expect(nested.fail).toHaveBeenCalledTimes(1)
    await tick()
    expect(params.onSuccess).not.toHaveBeenCalled()
    expect(nested.onSuccess).not.toHaveBeenCalled()
  })
})
