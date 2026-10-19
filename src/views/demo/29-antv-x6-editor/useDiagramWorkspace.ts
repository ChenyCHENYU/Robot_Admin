/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 独立图场景、只读预览和实时节点检查
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Graph, Node } from '@antv/x6'
import type {
  DiagramData,
  DiagramType,
} from '@robot-admin/naive-ui-components/C_AntV'
import { createDiagramData } from './data'
/** 场景切换前保留画布快照，预览使用同一份数据且关闭编辑交互。 */
export function useDiagramWorkspace() {
  const type = ref<DiagramType>('bpmn')
  const mode = ref('edit')
  const selectedId = ref('')
  const revision = ref(0)
  const diagramRef = ref<{
    getData: () => DiagramData
    getGraph: () => Graph
  } | null>(null)
  const snapshots: Partial<Record<DiagramType, DiagramData>> = {}
  const initialData = shallowRef(createDiagramData(type.value))
  const liveData = shallowRef(initialData.value)
  const selectedNode = shallowRef<{
    id: string
    name: string
    detail: string
    position: { x: number; y: number }
  } | null>(null)
  let active = true
  let graph: Graph | undefined
  let cleanup = () => {}
  const items = computed(() => {
    const data = liveData.value
    if (!data) return []
    if ('nodes' in data)
      return data.nodes.map(node => ({
        id: node.id,
        name: node.name,
        detail: node.type,
        position: node.position,
      }))
    if ('tables' in data)
      return data.tables.map(node => ({
        id: node.id,
        name: node.name,
        detail: `${node.fields.length} 个字段`,
        position: node.position,
      }))
    return data.classes.map(node => ({
      id: node.id,
      name: node.name,
      detail: `${node.attributes.length} 个属性 · ${node.methods.length} 个方法`,
      position: node.position,
    }))
  })
  const connections = computed(() => {
    const data = liveData.value
    return data
      ? 'flows' in data
        ? data.flows.length
        : data.relations.length
      : 0
  })
  const select = (id: string, center = true) => {
    selectedId.value = id
    selectedNode.value = items.value.find(item => item.id === id) ?? null
    const node = graph?.getCellById(id)
    if (node && center) graph?.centerCell(node)
  }
  const onReady = (value: Graph) => {
    cleanup()
    graph = value
    const handler = ({ node }: { node: Node }) => select(node.id, false)
    value.on('node:click', handler)
    cleanup = () => value.off('node:click', handler)
    void nextTick(() => {
      if (!active || graph !== value) return
      value.zoomToFit({ padding: 40, maxScale: 1 })
      if (items.value.length) select(items.value[0].id, false)
    })
  }
  const onChange = (value: DiagramData) => {
    liveData.value = value
    selectedNode.value =
      items.value.find(item => item.id === selectedId.value) ?? null
  }
  const capture = () => diagramRef.value?.getData() ?? liveData.value
  const fit = () => graph?.zoomToFit({ padding: 40, maxScale: 1 })
  const editSelected = () => {
    if (mode.value !== 'edit') return
    const node = graph?.getCellById(selectedId.value)
    if (node?.isNode()) graph?.trigger('node:dblclick', { node })
  }
  const reset = () => {
    initialData.value = createDiagramData(type.value)
    liveData.value = initialData.value
    selectedId.value = ''
    revision.value++
  }
  const exportJson = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(capture(), null, 2)], {
        type: 'application/json',
      })
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${type.value}-diagram.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  watch(type, (value, previous) => {
    const data = capture()
    if (data) snapshots[previous] = data
    initialData.value = snapshots[value] ?? createDiagramData(value)
    liveData.value = initialData.value
    selectedId.value = ''
    revision.value++
  })
  watch(mode, () => {
    initialData.value = capture()
    liveData.value = initialData.value
    revision.value++
  })
  onBeforeUnmount(() => {
    active = false
    cleanup()
  })
  return {
    type,
    mode,
    revision,
    diagramRef,
    initialData,
    liveData,
    items,
    connections,
    selectedId,
    selectedNode,
    select,
    onReady,
    onChange,
    fit,
    editSelected,
    reset,
    exportJson,
  }
}
