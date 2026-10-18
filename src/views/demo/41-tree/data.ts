/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\demo\41-tree\data.ts
 * @Description: 树组件场景、受控状态与可取消的本地加载演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  ComponentDensity,
  TreeExpose,
  TreeKey,
  TreeNodeData,
  TreeNativeProps,
  TreeOption,
  TreeUpdateMeta,
} from '@robot-admin/naive-ui-components/C_Tree'

interface Department extends TreeNodeData {
  code: string
  title: string
  items?: Department[]
}
export const DENSITY_OPTIONS = [
  { label: '紧凑', value: 'compact' },
  { label: '标准', value: 'default' },
  { label: '舒适', value: 'comfortable' },
]
export const CONTROLLED_TREE_PROPS: TreeNativeProps = {
  keyField: 'code',
  labelField: 'title',
  childrenField: 'items',
  disabledField: 'inactive',
  checkable: true,
  cascade: true,
  checkStrategy: 'child',
  showIrrelevantNodes: false,
  animated: false,
}
const DEPARTMENTS: Department[] = [
  {
    code: 'engineering',
    title: '研发中心',
    type: 'department',
    items: [
      {
        code: 'frontend',
        title: '前端研发组',
        type: 'department',
        items: [
          { code: 'web', title: '企业 Web 应用', type: 'user' },
          {
            code: 'design',
            title: '设计系统与组件平台（长名称自动省略，悬停可查看完整内容）',
            type: 'user',
          },
        ],
      },
      { code: 'backend', title: '后端研发组', type: 'department' },
      {
        code: 'legacy',
        title: '已停用部门',
        type: 'department',
        inactive: true,
      },
    ],
  },
  {
    code: 'operations',
    title: '运营中心',
    type: 'department',
    items: [
      { code: 'customers', title: '客户服务组', type: 'user' },
      { code: 'delivery', title: '项目交付组', type: 'user' },
    ],
  },
]
/** 固定的大树样本，实际渲染行交由原生虚拟列表控制。 */
const createLargeTree = (): TreeNodeData[] =>
  Array.from({ length: 100 }, (_, group) => ({
    id: `group-${group}`,
    name: `项目分组 ${String(group + 1).padStart(3, '0')}`,
    children: Array.from({ length: 20 }, (_, item) => ({
      id: `record-${group}-${item}`,
      name: `项目 ${String(group * 20 + item + 1).padStart(4, '0')}`,
    })),
  }))
/** 本地延迟同样接受取消信号，离开页面后不再提交旧数据。 */
const waitForDemo = (signal: AbortSignal) =>
  new Promise<boolean>(resolve => {
    const finish = (value: boolean) => {
      signal.removeEventListener('abort', cancel)
      resolve(value)
    }
    const timer = setTimeout(() => finish(true), 450)
    const cancel = () => {
      clearTimeout(timer)
      finish(false)
    }
    if (signal.aborted) cancel()
    else signal.addEventListener('abort', cancel, { once: true })
  })
/** 树演示控制器：组件状态、原生聚合配置、失败重试与清理。 */
export function useTreeDemo() {
  const density = ref<ComponentDensity>('compact')
  const treeRef = ref<TreeExpose>()
  const selectedKeys = ref<TreeKey[]>([])
  const expandedKeys = ref<TreeKey[]>(['engineering', 'frontend', 'operations'])
  const checkedKeys = ref<TreeKey[]>([])
  const keyword = ref('')
  const lastAction = ref('点击节点或勾选复选框，查看完整事件语义')
  const departments = ref<Department[]>(structuredClone(DEPARTMENTS))
  const largeTree = shallowRef(createLargeTree())
  const largeExpandedKeys = ref<TreeKey[]>(
    largeTree.value.map(node => node.id!)
  )
  const virtualSelectedKeys = ref<TreeKey[]>([])
  const lazyData = ref<TreeNodeData[]>([
    { id: 'remote-root', name: '项目资料库 · 展开加载', isLeaf: false },
  ])
  const lazyExpandedKeys = ref<TreeKey[]>([])
  const lazyFailure = ref('')
  const failNext = ref(true)
  const loadCount = ref(0)
  let generation = 0
  let controller = new AbortController()
  const checkedSummary = computed(() =>
    checkedKeys.value.length ? checkedKeys.value.join('、') : '未勾选'
  )
  const selectedSummary = computed(() =>
    selectedKeys.value.length ? selectedKeys.value.join('、') : '未选择'
  )
  const virtualTreeProps: TreeNativeProps = {
    showIrrelevantNodes: false,
    virtualScroll: true,
    animated: false,
  }
  const handleChecked = (
    keys: TreeKey[],
    _options: Array<TreeOption | null>,
    meta: TreeUpdateMeta
  ) => {
    lastAction.value = `${meta.action === 'check' ? '勾选' : '取消勾选'}：${keys.length} 个叶节点`
  }
  const handleSelected = (
    keys: TreeKey[],
    _options: Array<TreeOption | null>,
    meta: TreeUpdateMeta
  ) => {
    lastAction.value = `${meta.action === 'select' ? '选择' : '取消选择'}：${String(meta.node?.title ?? keys[0] ?? '无')}`
  }
  const clearState = () => {
    selectedKeys.value = []
    checkedKeys.value = []
    keyword.value = ''
  }
  const pickFrontend = () => {
    selectedKeys.value = ['frontend']
    keyword.value = ''
  }
  const checkLoadedLeaves = () => {
    checkedKeys.value = ['web', 'design', 'backend', 'customers', 'delivery']
  }
  const loadChildren = async (node: TreeOption) => {
    const current = generation
    const { signal } = controller
    const shouldFail = failNext.value
    failNext.value = false
    lazyFailure.value = ''
    loadCount.value++
    if (!(await waitForDemo(signal)) || current !== generation) return false
    if (shouldFail) throw new Error('演示网络暂时不可用')
    lazyData.value = lazyData.value.map(item =>
      item.id === node.id
        ? {
            ...item,
            children: [
              { id: 'doc-contract', name: '项目合同', isLeaf: true },
              { id: 'doc-plan', name: '实施计划', isLeaf: true },
              { id: 'doc-acceptance', name: '验收资料', isLeaf: true },
            ],
          }
        : item
    )
  }
  const lazyTreeProps: TreeNativeProps = {
    onLoad: loadChildren,
    animated: false,
  }
  const handleLoadError = (error: unknown) => {
    lazyFailure.value = error instanceof Error ? error.message : '加载失败'
  }
  const retryLoad = async () => {
    lazyExpandedKeys.value = []
    await nextTick()
    lazyExpandedKeys.value = ['remote-root']
  }
  const resetLazy = () => {
    generation++
    controller.abort()
    controller = new AbortController()
    lazyExpandedKeys.value = []
    lazyFailure.value = ''
    failNext.value = true
    loadCount.value = 0
    lazyData.value = [
      { id: 'remote-root', name: '项目资料库 · 展开加载', isLeaf: false },
    ]
  }
  onBeforeUnmount(() => {
    generation++
    controller.abort()
  })
  return {
    density,
    treeRef,
    selectedKeys,
    expandedKeys,
    checkedKeys,
    keyword,
    lastAction,
    departments,
    largeTree,
    largeExpandedKeys,
    virtualSelectedKeys,
    virtualTreeProps,
    lazyData,
    lazyExpandedKeys,
    lazyFailure,
    loadCount,
    lazyTreeProps,
    checkedSummary,
    selectedSummary,
    handleChecked,
    handleSelected,
    clearState,
    pickFrontend,
    checkLoadedLeaves,
    handleLoadError,
    retryLoad,
    resetLazy,
  }
}
