<template>
  <div class="uml-layout">
    <div
      class="toolbar"
      v-if="showToolbar"
    >
      <NSpace>
        <NButton
          @click="addClass"
          type="primary"
          size="small"
        >
          <template #icon><div class="i-mdi-plus-box"></div></template>
          添加类
        </NButton>
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
        <NDropdown
          :options="exportOptions"
          @select="(key: string) => handleExport(key, getCurrentData)"
        >
          <NButton size="small">
            <template #icon><div class="i-mdi-export"></div></template>
            导出
          </NButton>
        </NDropdown>
      </NSpace>
    </div>

    <div
      ref="containerRef"
      class="graph-container"
      :style="{ width: props.width, height: props.height }"
    ></div>

    <UMLClassEditor
      :show="showEditor"
      v-model:editing-class="editingClass"
      @update:show="showEditor = $event"
      @save="saveClass"
      @delete="deleteClass"
    />
  </div>
</template>

<script setup lang="ts">
  import { Graph, ObjectExt, type Node, type Cell } from '@antv/x6'
  import { useGraphBase } from '@/composables/AntV/useGraphBase'
  import { useGraphExport } from '@/composables/AntV/useGraphExport'
  import { useEdgeInteraction } from '@/composables/AntV/useEdgeInteraction'
  import type { UMLClass, UMLDiagramData } from '@/types/antv'
  import UMLClassEditor from './components/UMLClassEditor.vue'
  import {
    edgeTypes,
    classNodeConfig,
    connectingConfig,
    highlightingConfig,
    defaultEdgeConfig,
    sampleClasses,
    sampleConnections,
    getVisibilitySymbol,
    newClassTemplate,
  } from './data'

  interface Props {
    data?: UMLDiagramData
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
    ready: [graph: any]
    'data-change': [data: UMLDiagramData]
  }>()

  // ==================== Composables ====================
  const containerRef = ref<HTMLDivElement>()
  const { graph, initGraph, centerContent, zoomToFit } =
    useGraphBase(containerRef)
  const { exportOptions, handleExport } = useGraphExport(graph, 'uml-diagram')
  const { bindInteractions } = useEdgeInteraction(graph, {
    defaultColor: '#722ed1',
    portPositions: ['top', 'right', 'bottom', 'left'],
    onDataChange: () => emitDataChange(),
  })

  // ==================== 编辑器状态 ====================
  const showEditor = ref(false)
  const editingClass = ref<UMLClass>()

  // ==================== 节点注册 ====================
  const registerNodes = () => {
    Graph.registerNode(
      'class',
      {
        ...classNodeConfig,
        /** @description 节点属性钩子，用于计算 UML 类图节点布局 */
        propHooks(meta: any) {
          const { name, attributes, methods, ...others } = meta
          if (!(name && attributes && methods)) return meta

          let offsetY = 0
          ;[
            { type: 'name', text: name },
            { type: 'attrs', text: attributes },
            { type: 'methods', text: methods },
          ].forEach(rect => {
            const height = Array.isArray(rect.text)
              ? rect.text.length * 12 + 16
              : 32
            ObjectExt.setByPath(
              others,
              `attrs/${rect.type}-text/text`,
              Array.isArray(rect.text) ? rect.text.join('\n') : rect.text
            )
            ObjectExt.setByPath(
              others,
              `attrs/${rect.type}-rect/height`,
              height
            )
            ObjectExt.setByPath(
              others,
              `attrs/${rect.type}-rect/transform`,
              `translate(0,${offsetY})`
            )
            offsetY += height
          })
          others.size = { width: 160, height: offsetY }
          return others
        },
      },
      true
    )

    Object.entries(edgeTypes).forEach(([type, config]) => {
      Graph.registerEdge(
        type,
        {
          inherit: 'edge',
          attrs: { line: { strokeWidth: 2, stroke: '#722ed1', ...config } },
        },
        true
      )
    })
  }

  // ==================== 数据加载 ====================
  const loadData = (data: any[]) => {
    if (!graph.value || !data.length) return
    const edgeShapes = [
      'extends',
      'composition',
      'implement',
      'aggregation',
      'association',
    ]
    const cells: Cell[] = []

    data.forEach(item => {
      if (edgeShapes.includes(item.shape)) {
        cells.push(graph.value!.createEdge(item))
      } else {
        const { data: nodeData, ...displayProps } = item
        const node = graph.value!.createNode(displayProps)
        if (nodeData) node.setData(nodeData)
        cells.push(node)
      }
    })

    graph.value.resetCells(cells)
    setTimeout(() => graph.value!.zoomToFit({ padding: 10, maxScale: 1 }), 200)
  }

  const formatClassDisplay = (cls: {
    name: string
    attributes: any[]
    methods: any[]
  }) => ({
    name: cls.name,
    attributes: cls.attributes.map(
      attr =>
        `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
    ),
    methods: cls.methods.map(
      method =>
        `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
    ),
  })

  // ==================== 类 CRUD ====================
  const addClass = () => {
    if (!graph.value) return
    const newClass: UMLClass = {
      id: `class_${Date.now()}`,
      ...newClassTemplate,
    }
    const nodeData = {
      id: newClass.id,
      shape: 'class',
      x: newClass.position.x,
      y: newClass.position.y,
      ...formatClassDisplay(newClass),
      data: newClass,
    }
    graph.value.addCell(graph.value.createNode(nodeData))
    emitDataChange()
  }

  const editClass = (umlClass: UMLClass) => {
    editingClass.value = {
      ...umlClass,
      attributes: [...(umlClass.attributes || [])],
      methods: [...(umlClass.methods || [])],
    }
    showEditor.value = true
  }

  const saveClass = () => {
    if (!graph.value || !editingClass.value) return
    const node = graph.value.getCellById(editingClass.value.id) as Node
    if (node) {
      node.setData(editingClass.value)
      node.prop(formatClassDisplay(editingClass.value))
    }
    showEditor.value = false
    emitDataChange()
  }

  const deleteClass = () => {
    if (!graph.value || !editingClass.value) return
    graph.value.getCellById(editingClass.value.id)?.remove()
    showEditor.value = false
    emitDataChange()
  }

  // ==================== 数据获取 ====================
  const getCurrentData = (): UMLDiagramData => ({
    classes:
      graph.value?.getNodes().map((node: Node) => ({
        ...node.getData(),
        position: node.getPosition(),
      })) || [],
    relations:
      graph.value?.getEdges().map((edge: any) => ({
        id: edge.id,
        type: edge.shape as string,
        source: edge.getSourceCellId() || '',
        target: edge.getTargetCellId() || '',
      })) || [],
  })

  const emitDataChange = () => emit('data-change', getCurrentData())

  // ==================== Graph 事件绑定 ====================
  watch(
    graph,
    newGraph => {
      if (!(newGraph instanceof Graph)) return

      registerNodes()
      bindInteractions()

      newGraph.on('node:dblclick', ({ node }: { node: Node }) => {
        if (!props.readonly && node.getData()) editClass(node.getData())
      })

      emit('ready', newGraph)

      const defaultCells = [
        ...sampleClasses.map(cls => ({
          id: cls.id,
          shape: 'class',
          x: cls.x,
          y: cls.y,
          ...formatClassDisplay(cls),
          data: {
            id: cls.id,
            name: cls.name,
            attributes: cls.attributes,
            methods: cls.methods,
            position: { x: cls.x, y: cls.y },
          },
        })),
        ...sampleConnections,
      ]
      loadData(defaultCells)
    },
    { immediate: true }
  )

  watch(
    () => props.data,
    newData => {
      if (graph.value && newData?.classes) {
        const edgeShapes = [
          'extends',
          'composition',
          'implement',
          'aggregation',
          'association',
        ]
        const cells: any[] = [
          ...newData.classes.map(cls => ({
            id: cls.id,
            shape: 'class',
            x: cls.position?.x ?? 50,
            y: cls.position?.y ?? 50,
            ...formatClassDisplay(cls),
            data: cls,
          })),
          ...(newData.relations || [])
            .filter(r => edgeShapes.includes(r.type))
            .map(r => ({
              shape: r.type,
              source: r.source,
              target: r.target,
            })),
        ]
        loadData(cells)
      }
    },
    { deep: true }
  )

  onMounted(() => {
    initGraph({
      interacting: true,
      connecting: {
        ...connectingConfig,
        createEdge: () => graph.value!.createEdge(defaultEdgeConfig),
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
      highlighting: highlightingConfig,
    })
  })

  defineExpose({
    getGraph: () => graph.value,
    getData: getCurrentData,
    addClass,
    centerContent,
    zoomToFit,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
