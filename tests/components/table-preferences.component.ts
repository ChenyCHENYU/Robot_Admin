/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\tests\components\table-preferences.component.ts
 * @Description: 使用正式 MachTable 验证身份快照、KeepAlive 重建及延迟与异步保存隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import {
  defineComponent,
  h,
  KeepAlive,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import {
  createGrid,
  type GridApi,
  type GridStateInput,
  type GridStateStore,
  type MachTableVueProps,
} from '@agile-team/mach-table-vue'
import {
  getCurrentTablePreferenceScope,
  useScopedMachTableConfig,
} from '@/composables/useScopedMachTableConfig'
import { deferred } from './d_deferred'

const user = reactive({
  token: 'session-a',
  userInfo: { id: 'A', username: '同名显示' },
  activeContext: { tenantId: 'tenant', companyId: 'company' },
})
vi.mock('@/stores/user', () => ({ s_userStore: () => user }))

interface Row {
  id: string
  name: string
}

/** 只开启列宽偏好，避免测试混入查询及业务数据保存。 */
function config(store?: GridStateStore): MachTableVueProps<Row> {
  return {
    rowNumber: false,
    pagination: false,
    columnLayout: 'normal',
    columnDefs: [{ field: 'name', headerName: '名称', width: 150 }],
    rowData: [{ id: 'one', name: '记录' }],
    persistence: {
      key: 'orders:v3',
      sections: ['columns'],
      debounceMs: 200,
      ...(store ? { store } : {}),
    },
  }
}

/** 身份 key 放在 KeepAlive 所有者，旧账号缓存和 Core 会一起销毁。 */
function mountScopedLayout(tableConfig: MachTableVueProps<Row>) {
  const instances: GridApi<Row>[] = []
  const Owner = defineComponent({
    name: 'ScopedTableOwner',
    /** setup 捕获账号快照，卸载时交还 Core 自身的保存与清理流程。 */
    setup() {
      const snapshot = useScopedMachTableConfig(tableConfig)
      const host = ref<HTMLElement>()
      let api: GridApi<Row> | undefined
      onMounted(() => {
        api = createGrid(host.value!, snapshot)
        instances.push(api)
      })
      onBeforeUnmount(() => api?.destroy())
      return () => h('div', { ref: host })
    },
  })
  const wrapper = mount(
    defineComponent({
      name: 'ScopedLayoutHarness',
      setup: () => () =>
        h(
          KeepAlive,
          { key: getCurrentTablePreferenceScope() },
          { default: () => h(Owner) }
        ),
    }),
    { attachTo: document.body }
  )
  return { wrapper, instances }
}

const width = (api: GridApi<Row>) =>
  api.columns.getState().find(column => column.colId === 'name')!.width

/** 测试启用持久化的实例必须给出明确键，不用断言掩盖 false 分支。 */
const persistenceKey = (api: GridApi<Row>) => {
  const persistence = api.getOption('persistence')
  if (!persistence) throw new Error('实例未启用偏好持久化')
  return persistence.key
}

beforeEach(() => {
  user.token = 'session-a'
  user.userInfo.id = 'A'
  user.userInfo.username = '同名显示'
  user.activeContext.tenantId = 'tenant'
  user.activeContext.companyId = 'company'
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

test('配置捕获一次，保留 store、sections 与 debounce，身份变化不重定向旧配置', () => {
  const store = { load: () => null, save: vi.fn() }
  const original = config(store)
  const snapshot = useScopedMachTableConfig(original)
  const { persistence } = snapshot
  if (!persistence) throw new Error('A 应有有效身份范围')
  const { key } = persistence
  expect(JSON.parse(key)).toEqual([
    JSON.stringify([
      'robot-admin:table-preferences:v1',
      'tenant',
      'company',
      'A',
    ]),
    'orders:v3',
  ])
  user.token = 'refreshed-session'
  expect(getCurrentTablePreferenceScope()).toBe(JSON.parse(key)[0])
  expect(persistence.store).toBe(store)
  expect(persistence.sections).toBe(
    original.persistence && original.persistence.sections
  )
  expect(persistence.debounceMs).toBe(200)
  user.userInfo.id = 'B'
  expect(persistence.key).toBe(key)
  expect(useScopedMachTableConfig(original).persistence).not.toEqual(
    persistence
  )
  expect(original.persistence && original.persistence.key).toBe('orders:v3')
  user.token = ''
  expect(getCurrentTablePreferenceScope()).toBeUndefined()
  expect(useScopedMachTableConfig(original).persistence).toBe(false)
  user.token = 'session-b'
  user.userInfo.id = ''
  expect(useScopedMachTableConfig(original).persistence).toBe(false)
})

test('200ms 前切账号会销毁旧缓存并只 flush A，B 独立保存后 A 返回恢复自身列宽', async () => {
  vi.useFakeTimers()
  const states = new Map<string, GridStateInput>()
  const save = vi.fn((key: string, state: GridStateInput) => {
    states.set(key, structuredClone(state))
  })
  const load = vi.fn((key: string) => states.get(key) ?? null)
  const { wrapper, instances } = mountScopedLayout(config({ load, save }))
  const a = instances[0]!
  const aKey = persistenceKey(a)
  user.token = 'refreshed-session'
  user.userInfo.username = '新的显示名'
  await nextTick()
  expect(instances).toHaveLength(1)
  a.columns.setWidth('name', 260)
  vi.advanceTimersByTime(199)
  expect(save).not.toHaveBeenCalled()
  user.userInfo.id = 'B'
  await nextTick()
  const b = instances[1]!
  expect(a.isDestroyed()).toBe(true)
  expect(width(b)).toBe(150)
  expect(save.mock.calls.map(([key]) => key)).toEqual([aKey])
  vi.advanceTimersByTime(250)
  expect(width(b)).toBe(150)
  expect(save).toHaveBeenCalledTimes(1)
  b.columns.setWidth('name', 190)
  vi.advanceTimersByTime(200)
  const bKey = persistenceKey(b)
  expect(bKey).not.toBe(aKey)
  expect(save.mock.calls.map(([key]) => key)).toEqual([aKey, bKey])
  user.userInfo.id = 'A'
  await nextTick()
  expect(b.isDestroyed()).toBe(true)
  expect(width(instances[2]!)).toBe(260)
  expect(
    load.mock.calls.every(([key]) => JSON.parse(key)[1] === 'orders:v3')
  ).toBe(true)
  expect(load).not.toHaveBeenCalledWith('orders:v3')
  wrapper.unmount()
})

test('已开始和排队的 A 异步写入在销毁后仍只有 A 键，公司和租户变化也重新创建实例', async () => {
  const pending = deferred<void>()
  const save = vi.fn<NonNullable<GridStateStore['save']>>()
  save
    .mockImplementationOnce(() => pending.promise)
    .mockImplementation(() => {})
  const original = config({ load: () => null, save })
  if (!original.persistence) throw new Error('需要持久化配置')
  original.persistence.debounceMs = 0
  const { wrapper, instances } = mountScopedLayout(original)
  const a = instances[0]!
  const aKey = persistenceKey(a)
  a.columns.setWidth('name', 260)
  a.columns.setWidth('name', 280)
  user.userInfo.id = 'B'
  await nextTick()
  expect(width(instances[1]!)).toBe(150)
  pending.resolve()
  await flushPromises()
  expect(save.mock.calls.map(([key]) => key)).toEqual([aKey, aKey])
  expect(width(instances[1]!)).toBe(150)
  user.activeContext.companyId = 'company-2'
  await nextTick()
  expect(instances[1]!.isDestroyed()).toBe(true)
  expect(width(instances[2]!)).toBe(150)
  user.activeContext.tenantId = 'tenant-2'
  await nextTick()
  expect(instances[2]!.isDestroyed()).toBe(true)
  expect(width(instances[3]!)).toBe(150)
  wrapper.unmount()
})
