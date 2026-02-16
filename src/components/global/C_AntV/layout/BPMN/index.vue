<template>
  <div class="bpmn-layout">
    <div
      class="top-toolbar"
      v-if="showToolbar"
    >
      <div class="toolbar-section">
        <div class="toolbar-group">
          <NButton
            @click="clearAll"
            size="small"
          >
            <template #icon><div class="i-mdi-delete-outline"></div></template>
            清空
          </NButton>
        </div>
        <div class="toolbar-group">
          <NButton
            @click="centerContent"
            size="small"
          >
            <template #icon
              ><div class="i-mdi-image-filter-center-focus"></div
            ></template>
            居中
          </NButton>
          <NButton
            @click="zoomToFit"
            size="small"
          >
            <template #icon><div class="i-mdi-fit-to-screen"></div></template>
            适应
          </NButton>
        </div>
        <div class="toolbar-group">
          <NDropdown
            :options="exportOptions"
            @select="(key: string) => handleExport(key, getCurrentData)"
          >
            <NButton size="small">
              <template #icon><div class="i-mdi-export"></div></template>
              导出
            </NButton>
          </NDropdown>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div
        class="left-panel"
        v-if="showToolbar"
      >
        <div class="panel-title">组件</div>
        <div class="element-grid">
          <div
            v-for="(item, key) in elementTypes"
            :key="key"
            class="element-item"
            @click="addElement(key)"
            :title="item.title"
          >
            <div :class="['element-icon', item.iconClass]"></div>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>

      <div class="graph-wrapper">
        <div
          ref="containerRef"
          class="graph-container"
        ></div>
      </div>
    </div>

    <BPMNPropertyEditor
      :show="showEditor"
      v-model:editing-element="editingElement"
      @update:show="showEditor = $event"
      @save="saveElement"
      @delete="deleteElement"
    />
  </div>
</template>

<script setup lang="ts">
  import { Graph } from '@antv/x6'
  import { useGraphBase } from '@/composables/AntV/useGraphBase'
  import { useGraphExport } from '@/composables/AntV/useGraphExport'
  import { useEdgeInteraction } from '@/composables/AntV/useEdgeInteraction'
  import BPMNPropertyEditor from './components/BPMNPropertyEditor.vue'
  import {
    elementTypes,
    portPositions,
    createPortAttrs,
    nodeConfigs,
    edgeConfig,
    getGraphConfig,
    addElementConfigs,
    sampleData,
  } from './data'

  interface BPMNElement {
    id: string
    shape: string
    x: number
    y: number
    width?: number
    height?: number
    label?: string
    source?: string
    target?: string
    description?: string
    assignee?: string
    data?: any
    [key: string]: any
  }

  interface Props {
    data?: BPMNElement[] | Record<string, BPMNElement[]>
    showToolbar?: boolean
    readonly?: boolean
    width?: number | string
    height?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    showToolbar: true,
    readonly: false,
    width: '100%',
    height: '600px',
  })

  const emit = defineEmits<{
    ready: [graph: Graph]
    'data-change': [data: BPMNElement[]]
  }>()

  // ==================== Composables ====================
  const containerRef = ref<HTMLDivElement>()
  const { graph, initGraph, centerContent, zoomToFit } =
    useGraphBase(containerRef)
  const { exportOptions, handleExport } = useGraphExport(graph, 'bpmn-diagram')
  const { bindInteractions } = useEdgeInteraction(graph, {
    portPositions,
    onDataChange: () => emitDataChange(),
  })

  // ==================== 编辑器状态 ====================
  const showEditor = ref(false)
  const editingElement = ref<BPMNElement>()

  // ==================== 工具函数 ====================
  const getLabel = (cell: any): string =>
    String(cell.attr('text/text') || cell.attr('label/text') || '')

  const normalizeData = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    const result: any[] = []
    Object.values(data).forEach((arr: any) => {
      if (Array.isArray(arr)) result.push(...arr)
    })
    return result
  }

  // ==================== 节点注册 ====================
  const registerNodes = () => {
    const portMarkup = portPositions.map(pos => ({
      tagName: 'circle',
      selector: `port-${pos}`,
    }))

    const nodeTypes = ['event', 'activity', 'gateway'] as const
    const bodyTags = { event: 'circle', activity: 'rect', gateway: 'polygon' }

    nodeTypes.forEach(type => {
      Graph.registerNode(
        type,
        {
          ...nodeConfigs[type],
          markup: [
            { tagName: bodyTags[type], selector: 'body' },
            { tagName: 'text', selector: 'text' },
            ...portMarkup,
          ],
          attrs: {
            ...nodeConfigs[type].attrs,
            ...createPortAttrs(portPositions, bodyTags[type]),
          },
        },
        true
      )
    })

    Graph.registerEdge('bpmn-edge', edgeConfig, true)
  }

  // ==================== 数据操作 ====================
  const loadData = (data: any[]) => {
    if (!graph.value || !data.length) return
    const cells = data.map(item => {
      const { data: nodeData, ...cellProps } = item
      const cell =
        item.shape === 'bpmn-edge'
          ? graph.value!.createEdge(cellProps)
          : graph.value!.createNode(cellProps)
      if (nodeData) cell.setData(nodeData)
      return cell
    })
    graph.value.resetCells(cells)
    setTimeout(() => graph.value!.zoomToFit({ padding: 50, maxScale: 1 }), 200)
  }

  const addElement = (type: string) => {
    if (!graph.value) return
    const config = addElementConfigs[type as keyof typeof addElementConfigs]
    if (!config) return

    const centerX = (graph.value.options.width as number) / 2
    const centerY = (graph.value.options.height as number) / 2
    const { data: nodeData, ...nodeProps } = {
      id: `${type}-${Date.now()}`,
      x: centerX + Math.random() * 100 - 50,
      y: centerY + Math.random() * 100 - 50,
      ...config,
    }
    const node = graph.value.createNode(nodeProps)
    if (nodeData) node.setData(nodeData)
    graph.value.addCell(node)
    emitDataChange()
  }

  const clearAll = () => {
    graph.value?.clearCells()
    emitDataChange()
  }

  // ==================== 元素编辑 ====================
  const editElement = (cell: any) => {
    const cellData = cell.getData() || {}
    editingElement.value = {
      id: cell.id,
      shape: cell.shape,
      label: getLabel(cell),
      description: cellData.description || '',
      assignee: cellData.assignee || '',
      x: 0,
      y: 0,
    }
    showEditor.value = true
  }

  const saveElement = () => {
    if (!graph.value || !editingElement.value) return
    const cell = graph.value.getCellById(editingElement.value.id)
    if (cell) {
      cell.setData({
        description: editingElement.value.description,
        assignee: editingElement.value.assignee,
      })
      cell.attr('text/text', editingElement.value.label || '')
      cell.attr('label/text', editingElement.value.label || '')
    }
    showEditor.value = false
    emitDataChange()
  }

  const deleteElement = () => {
    if (!graph.value || !editingElement.value) return
    graph.value.getCellById(editingElement.value.id)?.remove()
    showEditor.value = false
    emitDataChange()
  }

  // ==================== 数据获取 ====================
  const getCurrentData = (): BPMNElement[] => {
    if (!graph.value) return []
    return [
      ...graph.value.getNodes().map(node => ({
        id: node.id,
        shape: node.shape,
        x: node.getPosition().x,
        y: node.getPosition().y,
        width: node.getSize().width,
        height: node.getSize().height,
        label: getLabel(node),
        data: node.getData() || {},
      })),
      ...graph.value.getEdges().map(edge => ({
        id: edge.id,
        shape: 'bpmn-edge',
        source: edge.getSourceCellId() || '',
        target: edge.getTargetCellId() || '',
        label: getLabel(edge),
        x: 0,
        y: 0,
      })),
    ] as BPMNElement[]
  }

  const emitDataChange = () => emit('data-change', getCurrentData())

  // ==================== Graph 事件绑定 ====================
  watch(
    graph,
    newGraph => {
      if (!(newGraph instanceof Graph)) return

      if (!props.readonly) {
        bindInteractions()
        newGraph.on('node:dblclick', ({ node }) => editElement(node))
        newGraph.on('node:moved', emitDataChange)
      }

      emit('ready', newGraph)
      loadData(sampleData)
    },
    { immediate: true }
  )

  watch(
    () => props.data,
    newData => {
      if (!newData || !graph.value) return
      const normalized = normalizeData(newData)
      if (normalized.length > 0) loadData(normalized)
    },
    { deep: true }
  )

  onMounted(async () => {
    registerNodes()
    const bpmnConfig = getGraphConfig()
    await initGraph({
      ...bpmnConfig,
      connecting: {
        ...bpmnConfig.connecting,
        createEdge: () => graph.value!.createEdge({ shape: 'bpmn-edge' }),
        validateConnection: ({
          sourceView,
          targetView,
          sourceMagnet,
          targetMagnet,
        }: any) =>
          sourceView !== targetView &&
          !!sourceMagnet &&
          !!targetMagnet &&
          sourceMagnet.getAttribute('magnet') === 'true' &&
          targetMagnet.getAttribute('magnet') === 'true',
      },
    })
  })

  defineExpose({
    getGraph: () => graph.value,
    getData: getCurrentData,
    loadData,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
