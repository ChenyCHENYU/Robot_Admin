/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-21
 * @FilePath: \Robot_Admin\tests\components\map-placement.component.ts
 * @Description: 地图选点的双 SDK 坐标、确认边界和事件清理回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useMapPlacement } from '@/views/demo/36-map/useMapPlacement'

/** 以真实 Vue 生命周期挂载控制器，通过 SDK 事件合同驱动。 */
function setupPlacement() {
  const confirmed = vi.fn()
  let placement!: ReturnType<typeof useMapPlacement>
  const wrapper = mount(
    defineComponent({
      name: 'MapPlacementHarness',
      /** 为控制器提供真实挂载与卸载生命周期。 */
      setup() {
        placement = useMapPlacement(confirmed)
        return () => null
      },
    })
  )
  const listeners = new Set<(event: unknown) => void>()
  const map = {
    on: vi.fn((_event: 'click', listener: (event: unknown) => void) =>
      listeners.add(listener)
    ),
    off: vi.fn((_event: 'click', listener: (event: unknown) => void) =>
      listeners.delete(listener)
    ),
    click: (event: unknown) => listeners.forEach(listener => listener(event)),
  }
  placement.bindMap(map)
  return { placement, confirmed, wrapper, map, listeners }
}

test('普通浏览不添加，选点也不提交；确认采用原始坐标且重复确认不重复创建', () => {
  const { placement, confirmed, wrapper, map } = setupPlacement()
  map.click({ latlng: { lat: 31.23861234, lng: 121.49071234 } })
  expect(placement.pendingPosition.value).toBeNull()
  expect(placement.beginPlacement('客户拜访点')).toBe(true)
  expect(confirmed).not.toHaveBeenCalled()
  map.click({ latlng: { lat: 31.23861234, lng: 121.49071234 } })
  expect(placement.previewMarker.value).toMatchObject({
    lat: 31.23861234,
    lng: 121.49071234,
  })
  expect(confirmed).not.toHaveBeenCalled()
  placement.confirmOnEnter(
    new KeyboardEvent('keydown', { key: 'Enter', isComposing: true })
  )
  expect(confirmed).not.toHaveBeenCalled()
  placement.confirmOnEnter(new KeyboardEvent('keydown', { key: 'Enter' }))
  placement.confirmPlacement()
  expect(confirmed).toHaveBeenCalledTimes(1)
  expect(confirmed).toHaveBeenCalledWith(
    expect.objectContaining({
      lat: 31.23861234,
      lng: 121.49071234,
      popup: '客户拜访点',
    })
  )
  expect(placement.pendingPosition.value).toBeNull()
  expect(placement.isPicking.value).toBe(false)
  wrapper.unmount()
})

test('高德 getter 坐标保持经纬度方向，重新选点保留名称并替换草稿', () => {
  const { placement, confirmed, wrapper, map } = setupPlacement()
  placement.beginPlacement('新位置')
  map.click({ lnglat: { getLat: () => 23.1096, getLng: () => 113.3245 } })
  expect(placement.pendingPosition.value).toEqual([23.1096, 113.3245])
  placement.markerName.value = '广州客户'
  placement.chooseAgain()
  map.click({ lnglat: { getLat: () => 23.1196, getLng: () => 113.3145 } })
  placement.confirmPlacement()
  expect(confirmed).toHaveBeenCalledWith(
    expect.objectContaining({ lat: 23.1196, lng: 113.3145, popup: '广州客户' })
  )
  wrapper.unmount()
})

test('非法坐标和空名称不能提交，取消和 Esc 都清空草稿', () => {
  const { placement, confirmed, wrapper, map } = setupPlacement()
  placement.beginPlacement('临时标记')
  for (const event of [
    null,
    {},
    { latlng: { lat: NaN, lng: 116 } },
    { latlng: { lat: 121, lng: 31 } },
  ]) {
    map.click(event)
    expect(placement.pendingPosition.value).toBeNull()
  }
  map.click({ latlng: { lat: 39.9, lng: 116.4 } })
  placement.markerName.value = '   '
  placement.confirmPlacement()
  expect(placement.canConfirm.value).toBe(false)
  expect(confirmed).not.toHaveBeenCalled()
  placement.cancelPlacement()
  expect(placement.previewMarker.value).toBeNull()
  placement.beginPlacement('临时标记')
  map.click({ latlng: { lat: 39.9, lng: 116.4 } })
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  expect(placement.isPicking.value).toBe(false)
  expect(placement.previewMarker.value).toBeNull()
  expect(confirmed).not.toHaveBeenCalled()
  wrapper.unmount()
})

test('重复绑定只保留一个监听，SDK 重建和页面销毁均取消未提交位置', () => {
  const { placement, confirmed, wrapper, map, listeners } = setupPlacement()
  placement.bindMap(map)
  expect(listeners.size).toBe(1)
  placement.beginPlacement('临时标记')
  map.click({ latlng: { lat: 39.9, lng: 116.4 } })
  placement.bindMap(map)
  expect(placement.pendingPosition.value).toBeNull()
  expect(placement.isPicking.value).toBe(false)
  placement.beginPlacement('临时标记')
  wrapper.unmount()
  expect(listeners.size).toBe(0)
  map.click({ latlng: { lat: 39.9, lng: 116.4 } })
  expect(confirmed).not.toHaveBeenCalled()
})
