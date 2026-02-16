<template>
  <div class="er-layout">
    <!-- 工具栏 -->
    <div
      class="toolbar"
      v-if="showToolbar"
    >
      <NSpace>
        <NButton
          @click="addTable"
          type="primary"
          size="small"
        >
          <template #icon><div class="i-mdi:table-plus"></div></template>
          添加表
        </NButton>
        <NButton
          @click="centerContent"
          size="small"
        >
          <template #icon
            ><div class="i-mdi:image-filter-center-focus"></div
          ></template>
          居中
        </NButton>
        <NButton
          @click="zoomToFit"
          size="small"
        >
          <template #icon><div class="i-mdi:fit-to-screen"></div></template>
          适应
        </NButton>
        <NButton
          @click="toggleDeleteMode"
          :type="deleteMode ? 'error' : 'default'"
          size="small"
        >
          <template #icon><div class="i-mdi:delete"></div></template>
          {{ deleteMode ? '退出删除' : '删除连线' }}
        </NButton>
        <NDropdown
          :options="exportOptions"
          @select="(key: string) => handleExport(key, getCurrentData)"
        >
          <NButton size="small">
            <template #icon><div class="i-mdi:export"></div></template>
            导出
          </NButton>
        </NDropdown>
      </NSpace>

      <div
        v-if="deleteMode"
        style="margin-top: 8px"
      >
        <NAlert
          type="info"
          size="small"
          :show-icon="false"
        >
          删除模式：点击连接线即可删除
        </NAlert>
      </div>
    </div>

    <!-- 图表容器 -->
    <div
      ref="containerRef"
      class="graph-container"
    ></div>

    <!-- 表编辑器 -->
    <ERTableEditor
      :show="showEditor"
      v-model:editing-table="editingTable"
      @update:show="showEditor = $event"
      @save="saveTable"
      @add-field="addField"
      @remove-field="removeField"
      @handle-primary-key="handlePrimaryKey"
    />
  </div>
</template>

<script setup lang="ts">
  import { Node, Graph, Cell, Edge } from '@antv/x6'
  import { useGraphBase } from '@/composables/AntV/useGraphBase'
  import { useGraphExport } from '@/composables/AntV/useGraphExport'
  import type {
    ERTable,
    ERField,
    ERDiagramData,
    ERRelation,
  } from '@/types/antv'
  import ERTableEditor from './components/ERTableEditor.vue'

  interface Props {
    data?: ERDiagramData
    showToolbar?: boolean
    readonly?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showToolbar: true,
    readonly: false,
  })

  const emit = defineEmits<{
    (e: 'ready', graph: Graph): void
    (e: 'data-change', data: ERDiagramData): void
  }>()

  // ==================== Composables ====================
  const containerRef = ref<HTMLDivElement>()
  const { graph, initGraph, centerContent, zoomToFit } =
    useGraphBase(containerRef)
  const { exportOptions, handleExport } = useGraphExport(graph, 'er-diagram')

  // ==================== 编辑器状态 ====================
  const showEditor = ref(false)
  const editingTable = ref<ERTable>()
  const deleteMode = ref(false)

  // ==================== 工具函数 ====================
  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength - 1) + '..' : text

  const createPortConfig = (table: ERTable) =>
    table.fields?.map(field => {
      const displayName = field.isPrimaryKey
        ? `🔑 ${field.name}`
        : field.isRequired
          ? `* ${field.name}`
          : field.name
      return {
        id: `${table.id}_${field.name}`,
        group: 'list',
        attrs: {
          portNameLabel: {
            text: truncateText(displayName, 12),
            title: displayName,
          },
          portTypeLabel: {
            text: truncateText(field.type, 10),
            title: field.type,
          },
          portBody: { fill: field.isPrimaryKey ? '#FFF7E6' : '#EFF4FF' },
        },
      }
    }) || []

  const createNodeConfig = (table: ERTable) => ({
    id: table.id,
    shape: 'er-rect',
    x: table.position.x,
    y: table.position.y,
    width: 200,
    height: 24 + (table.fields?.length || 0) * 24,
    data: table,
    attrs: {
      label: {
        text: truncateText(table.name, 20),
        refX: 0.5,
        refY: 10,
        textAnchor: 'middle',
        title: table.name,
      },
    },
    ports: createPortConfig(table),
  })

  // ==================== 节点注册 ====================
  const registerNodes = () => {
    if (!graph.value) return

    Graph.registerPortLayout(
      'erPortPosition',
      portsPositionArgs =>
        portsPositionArgs.map((_, index) => ({
          position: { x: 0, y: (index + 1) * 24 },
          angle: 0,
        })),
      true
    )

    Graph.registerNode(
      'er-rect',
      {
        inherit: 'rect',
        markup: [
          { tagName: 'rect', selector: 'body' },
          { tagName: 'text', selector: 'label' },
        ],
        attrs: {
          rect: { strokeWidth: 1, stroke: '#5F95FF', fill: '#5F95FF' },
          label: { fontWeight: 'bold', fill: '#ffffff', fontSize: 12 },
        },
        ports: {
          groups: {
            list: {
              markup: [
                { tagName: 'rect', selector: 'portBody' },
                { tagName: 'text', selector: 'portNameLabel' },
                { tagName: 'text', selector: 'portTypeLabel' },
              ],
              attrs: {
                portBody: {
                  width: 200,
                  height: 24,
                  strokeWidth: 1,
                  stroke: '#5F95FF',
                  fill: '#EFF4FF',
                  magnet: true,
                },
                portNameLabel: {
                  ref: 'portBody',
                  refX: 6,
                  refY: 6,
                  fontSize: 9,
                  textAnchor: 'start',
                  textOverflow: 'ellipsis',
                },
                portTypeLabel: {
                  ref: 'portBody',
                  refX: 120,
                  refY: 6,
                  fontSize: 9,
                  textAnchor: 'start',
                  fill: '#666',
                },
              },
              position: 'erPortPosition',
            },
          },
        },
      },
      true
    )
  }

  // ==================== 删除模式 ====================
  const toggleDeleteMode = () => {
    deleteMode.value = !deleteMode.value
    if (!deleteMode.value) resetEdgeStyles()
  }

  const resetEdgeStyles = () => {
    graph.value?.getEdges().forEach(edge => {
      edge.attr('line/stroke', '#A2B1C3')
      edge.attr('line/strokeWidth', 2)
    })
  }

  // ==================== 表 CRUD ====================
  const createTableNode = (table: ERTable) => {
    if (!graph.value) return
    const node = graph.value.createNode(createNodeConfig(table))
    graph.value.resetCells([node, ...graph.value.getCells()])
    return node
  }

  const findPosition = () => {
    const nodes = graph.value?.getNodes() || []
    const spacing = 250
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 3; col++) {
        const pos = { x: col * spacing + 50, y: row * spacing + 50 }
        const hasOverlap = nodes.some(node => {
          const nodePos = node.getPosition()
          return (
            Math.abs(nodePos.x - pos.x) < spacing * 0.8 &&
            Math.abs(nodePos.y - pos.y) < spacing * 0.8
          )
        })
        if (!hasOverlap) return pos
      }
    }
    return { x: 50, y: 50 }
  }

  const addTable = () => {
    const newTable: ERTable = {
      id: `table_${Date.now()}`,
      name: '新表',
      comment: '',
      fields: [
        {
          name: 'id',
          type: 'BIGINT',
          isPrimaryKey: true,
          isRequired: true,
          isForeignKey: false,
          comment: '主键',
        },
        {
          name: 'name',
          type: 'VARCHAR(100)',
          isPrimaryKey: false,
          isRequired: true,
          isForeignKey: false,
          comment: '名称',
        },
      ],
      position: findPosition(),
    }
    createTableNode(newTable)
    editTable(newTable)
    emitDataChange()
  }

  const editTable = (table: ERTable) => {
    editingTable.value = {
      ...table,
      fields: table.fields?.map(field => ({ ...field })) || [],
    }
    showEditor.value = true
  }

  const saveTable = () => {
    if (!graph.value || !editingTable.value) return
    const node = graph.value.getCellById(editingTable.value.id) as Node
    if (node) {
      node.setData(editingTable.value)
      node.prop({
        size: {
          width: 200,
          height: 24 + editingTable.value.fields.length * 24,
        },
        attrs: {
          label: {
            text: truncateText(editingTable.value.name, 20),
            title: editingTable.value.name,
          },
        },
        ports: createPortConfig(editingTable.value),
      })
    }
    showEditor.value = false
    emitDataChange()
  }

  // ==================== 字段操作（由子组件事件触发） ====================
  const handlePrimaryKey = (field: ERField, isPrimaryKey: boolean) => {
    if (!isPrimaryKey) return
    field.isRequired = true
    editingTable.value?.fields.forEach(f => {
      if (f !== field) f.isPrimaryKey = false
    })
  }

  const addField = () => {
    editingTable.value?.fields.push({
      name: `field_${(editingTable.value?.fields.length || 0) + 1}`,
      type: 'VARCHAR(100)',
      isPrimaryKey: false,
      isRequired: false,
      isForeignKey: false,
      comment: '',
    })
  }

  const removeField = (index: number) => {
    if (editingTable.value && editingTable.value.fields.length > 1)
      editingTable.value.fields.splice(index, 1)
  }

  // ==================== 数据获取 ====================
  const getCurrentData = (): ERDiagramData => {
    if (!graph.value) return { tables: [], relations: [] }

    const tables = graph.value.getNodes().map((node: any) => ({
      ...node.getData(),
      position: node.getPosition(),
    }))

    const relations: ERRelation[] = []
    graph.value.getEdges().forEach((edge: any) => {
      const source = edge.getSourceNode()
      const target = edge.getTargetNode()
      const sourcePort = edge.getSourcePortId()
      const targetPort = edge.getTargetPortId()
      if (source && target && sourcePort && targetPort) {
        relations.push({
          id: edge.id,
          type: 'foreign-key',
          sourceTable: source.id,
          sourceField: sourcePort.split('_').slice(1).join('_'),
          targetTable: target.id,
          targetField: targetPort.split('_').slice(1).join('_'),
          name: `${source.getData()?.name || source.id} -> ${target.getData()?.name || target.id}`,
        })
      }
    })
    return { tables, relations }
  }

  const emitDataChange = () => emit('data-change', getCurrentData())

  // ==================== Graph 事件绑定 ====================
  watch(
    graph,
    newGraph => {
      if (!(newGraph instanceof Graph)) return

      registerNodes()
      newGraph.on('node:dblclick', ({ node }) => {
        if (!props.readonly) editTable(node.getData() as ERTable)
      })
      newGraph.on('edge:connected', emitDataChange)
      newGraph.on('edge:removed', emitDataChange)

      let selectedEdge: Edge | null = null

      newGraph.on('edge:click', ({ edge }) => {
        if (deleteMode.value) {
          edge.remove()
          emitDataChange()
        } else {
          resetEdgeStyles()
          edge.attr('line/stroke', '#ff4d4f')
          edge.attr('line/strokeWidth', 3)
          selectedEdge = edge
        }
      })
      newGraph.on('edge:dblclick', ({ edge }) => {
        edge.remove()
        emitDataChange()
      })
      newGraph.on('blank:click', () => {
        selectedEdge = null
        if (!deleteMode.value) resetEdgeStyles()
      })

      const handleKeyDown = (e: KeyboardEvent) => {
        // 忽略来自 input/textarea/contenteditable 元素的按键
        const tag = (e.target as HTMLElement)?.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          (e.target as HTMLElement)?.isContentEditable
        )
          return

        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdge) {
          selectedEdge.remove()
          emitDataChange()
          selectedEdge = null
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      onUnmounted(() => document.removeEventListener('keydown', handleKeyDown))

      emit('ready', newGraph)

      nextTick(() => {
        if (props.data?.tables) {
          const cells: Cell[] = props.data.tables.map(table =>
            newGraph.createNode(createNodeConfig(table))
          )

          if (props.data.relations?.length) {
            props.data.relations.forEach(relation => {
              cells.push(
                newGraph.createEdge({
                  source: {
                    cell: relation.sourceTable,
                    port: `${relation.sourceTable}_${relation.sourceField}`,
                  },
                  target: {
                    cell: relation.targetTable,
                    port: `${relation.targetTable}_${relation.targetField}`,
                  },
                  attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2 } },
                })
              )
            })
          }

          newGraph.resetCells(cells)
          setTimeout(
            () => newGraph.zoomToFit({ padding: 20, maxScale: 1 }),
            300
          )
        }
      })
    },
    { immediate: true }
  )

  watch(
    () => props.data,
    newData => {
      if (graph.value && newData?.tables) {
        const cells: Cell[] = newData.tables.map(table =>
          graph.value!.createNode(createNodeConfig(table))
        )

        // 加载关系连线
        if (newData.relations?.length) {
          newData.relations.forEach(relation => {
            cells.push(
              graph.value!.createEdge({
                source: {
                  cell: relation.sourceTable,
                  port: `${relation.sourceTable}_${relation.sourceField}`,
                },
                target: {
                  cell: relation.targetTable,
                  port: `${relation.targetTable}_${relation.targetField}`,
                },
                attrs: { line: { stroke: '#A2B1C3', strokeWidth: 2 } },
              })
            )
          })
        }

        graph.value.resetCells(cells)
      }
    },
    { deep: true }
  )

  onMounted(() => initGraph())

  defineExpose({
    getGraph: () => graph.value ?? undefined,
    getData: getCurrentData,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
