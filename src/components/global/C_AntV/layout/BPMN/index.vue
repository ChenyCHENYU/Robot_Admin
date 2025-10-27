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
            @select="handleExport"
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

    <NDrawer
      v-model:show="showEditor"
      width="300"
      title="属性设置"
    >
      <div
        v-if="editingElement"
        class="property-panel"
      >
        <div class="property-item">
          <div class="property-label">名称</div>
          <NInput
            v-model:value="editingElement.label"
            placeholder="请输入名称"
            size="small"
          />
        </div>
        <div class="property-item">
          <div class="property-label">类型</div>
          <NInput
            :value="getElementTypeName(editingElement.shape)"
            readonly
            size="small"
          />
        </div>
        <div
          class="property-item"
          v-if="editingElement.shape === 'activity'"
        >
          <div class="property-label">描述</div>
          <NInput
            v-model:value="editingElement.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
            size="small"
          />
        </div>
        <div
          class="property-item"
          v-if="editingElement.shape === 'activity'"
        >
          <div class="property-label">执行人</div>
          <NInput
            v-model:value="editingElement.assignee"
            placeholder="请输入执行人"
            size="small"
          />
        </div>
        <div class="form-actions">
          <NSpace>
            <NButton
              @click="saveElement"
              type="primary"
              size="small"
              >保存</NButton
            >
            <NButton
              @click="showEditor = false"
              size="small"
              >取消</NButton
            >
            <NButton
              @click="deleteElement"
              type="error"
              size="small"
              >删除</NButton
            >
          </NSpace>
        </div>
      </div>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, nextTick } from 'vue'
  import { Graph, type Node } from '@antv/x6'
  import { useThemeStore } from '@/stores/theme'
  import {
    exportOptions,
    elementTypes,
    elementTypeNames,
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

  const containerRef = ref<HTMLDivElement>()
  const showEditor = ref(false)
  const editingElement = ref<BPMNElement>()
  const graph = ref<Graph>()
  const themeStore = useThemeStore()

  const getElementTypeName = (shape: string) =>
    elementTypeNames[shape as keyof typeof elementTypeNames] || shape

  const centerContent = () => graph.value?.centerContent()
  const zoomToFit = () => graph.value?.zoomToFit({ padding: 50, maxScale: 1 })

  const normalizeData = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    const result: any[] = []
    Object.values(data).forEach((arr: any) => {
      if (Array.isArray(arr)) result.push(...arr)
    })
    return result
  }

  // 简化标签获取函数
  const getLabel = (cell: any): string => {
    const label = cell.attr('text/text') || cell.attr('label/text') || ''
    return String(label)
  }

  const registerNodes = () => {
    const portMarkup = portPositions.map(pos => ({
      tagName: 'circle',
      selector: `port-${pos}`,
    }))

    // 事件节点
    Graph.registerNode(
      'event',
      {
        ...nodeConfigs.event,
        markup: [
          { tagName: 'circle', selector: 'body' },
          { tagName: 'text', selector: 'text' },
          ...portMarkup,
        ],
        attrs: {
          ...nodeConfigs.event.attrs,
          ...createPortAttrs(portPositions),
        },
      },
      true
    )

    // 活动节点
    Graph.registerNode(
      'activity',
      {
        ...nodeConfigs.activity,
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'text', selector: 'text' },
          ...portMarkup,
        ],
        attrs: {
          ...nodeConfigs.activity.attrs,
          ...createPortAttrs(portPositions),
        },
      },
      true
    )

    // 网关节点
    Graph.registerNode(
      'gateway',
      {
        ...nodeConfigs.gateway,
        markup: [
          { tagName: 'polygon', selector: 'body' },
          { tagName: 'text', selector: 'text' },
          ...portMarkup,
        ],
        attrs: {
          ...nodeConfigs.gateway.attrs,
          ...createPortAttrs(portPositions),
        },
      },
      true
    )

    // BPMN连线
    Graph.registerEdge('bpmn-edge', edgeConfig, true)
  }

  const initGraph = async () => {
    if (!containerRef.value) return
    await nextTick()

    const containerWidth = containerRef.value.clientWidth || 800
    const containerHeight = containerRef.value.clientHeight || 500

    // 获取当前主题配置
    const graphConfig = getGraphConfig(themeStore.isDark)

    // 使用类型断言解决类型问题
    graph.value = new Graph({
      container: containerRef.value,
      width: containerWidth,
      height: containerHeight,
      ...graphConfig,
      connecting: {
        ...graphConfig.connecting,
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
    } as any) // 类型断言解决selecting等属性问题

    if (!props.readonly) {
      // 节点双击编辑
      graph.value.on('node:dblclick', ({ node }) => editElement(node))

      // 连接线点击选中，变红
      graph.value.on('edge:click', ({ edge }) => {
        edge.attr('line/stroke', '#ff4d4f')
      })

      // 连接线双击删除
      graph.value.on('edge:dblclick', ({ edge }) => {
        edge.remove()
        emitDataChange()
      })

      // 点击空白区域时，恢复连接线颜色
      graph.value.on('blank:click', () => {
        graph.value!.getEdges().forEach(edge => {
          edge.attr('line/stroke', '#A2B1C3')
        })
      })

      // 选中其他元素时，恢复连接线颜色
      graph.value.on('node:click', () => {
        graph.value!.getEdges().forEach(edge => {
          edge.attr('line/stroke', '#A2B1C3')
        })
      })

      graph.value.on('edge:connected', emitDataChange)
      graph.value.on('node:moved', emitDataChange)

      // 连接点显示/隐藏
      const togglePorts = (node: Node, opacity: number) => {
        portPositions.forEach(pos =>
          node.attr(`port-${pos}/style/opacity`, opacity)
        )
      }

      graph.value.on('node:mouseenter', ({ node }) => togglePorts(node, 1))
      graph.value.on('node:mouseleave', ({ node }) => togglePorts(node, 0))
    }

    emit('ready', graph.value)
    loadSampleData()
  }

  const loadData = (data: any[]) => {
    if (!graph.value || !data.length) return

    const cells: any[] = []
    data.forEach((item: any) => {
      const { data: nodeData, ...cellProps } = item
      const cell =
        item.shape === 'bpmn-edge'
          ? graph.value!.createEdge(cellProps)
          : graph.value!.createNode(cellProps)
      if (nodeData) cell.setData(nodeData)
      cells.push(cell)
    })

    graph.value.resetCells(cells)
    setTimeout(() => graph.value!.zoomToFit({ padding: 50, maxScale: 1 }), 200)
  }

  const loadSampleData = () => {
    loadData(sampleData)
  }

  const addElement = (type: string) => {
    if (!graph.value) return

    const centerX = (graph.value.options.width as number) / 2
    const centerY = (graph.value.options.height as number) / 2

    const config = addElementConfigs[type as keyof typeof addElementConfigs]
    if (config) {
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
  }

  const clearAll = () => {
    if (graph.value) {
      graph.value.clearCells()
      emitDataChange()
    }
  }

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
    } as any
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

  const getCurrentData = (): BPMNElement[] => {
    if (!graph.value) return []

    const result: any[] = [
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
    ]

    return result as BPMNElement[]
  }

  const handleExport = (key: string) => {
    if (!graph.value) return

    const data = getCurrentData()
    const exportMap = {
      png: () =>
        (graph.value as any).toPNG?.((dataUri: string) => {
          const link = document.createElement('a')
          link.download = 'bpmn-diagram.png'
          link.href = dataUri
          link.click()
        }),
      svg: () =>
        (graph.value as any).toSVG?.((dataUri: string) => {
          const link = document.createElement('a')
          link.download = 'bpmn-diagram.svg'
          link.href = dataUri
          link.click()
        }),
      json: () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bpmn-diagram.json'
        a.click()
        URL.revokeObjectURL(url)
      },
    }
    exportMap[key as keyof typeof exportMap]?.()
  }

  const emitDataChange = () => emit('data-change', getCurrentData() as any)

  watch(
    () => props.data,
    newData => {
      if (newData && graph.value) {
        const normalizedData = normalizeData(newData)
        if (normalizedData.length > 0) {
          loadData(normalizedData)
        }
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    registerNodes()
    await initGraph()
  })

  // 监听主题切换
  watch(
    () => themeStore.isDark,
    isDark => {
      if (!graph.value) return

      const config = getGraphConfig(isDark)

      // 动态更新背景和网格
      graph.value.drawBackground(config.background)
      graph.value.drawGrid(config.grid)
    }
  )

  defineExpose({
    getGraph: () => graph.value,
    getData: getCurrentData,
    loadData,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
