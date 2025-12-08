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
          @select="handleExport"
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
    <NDrawer
      v-model:show="showEditor"
      width="600"
      placement="right"
    >
      <NDrawerContent
        :title="`编辑表: ${editingTable?.name || '新表'}`"
        closable
      >
        <div class="table-editor">
          <NForm
            :model="editingTable"
            label-placement="top"
            v-if="editingTable"
          >
            <NFormItem label="表名">
              <NInput
                v-model:value="editingTable.name"
                placeholder="请输入表名"
              />
            </NFormItem>
            <NFormItem label="表注释">
              <NInput
                v-model:value="editingTable.comment"
                placeholder="表注释"
              />
            </NFormItem>

            <NDivider>字段列表</NDivider>

            <div class="fields-container">
              <NCard
                v-for="(field, index) in editingTable.fields"
                :key="index"
                size="small"
                class="field-card"
              >
                <template #header>
                  <div class="field-header">
                    <span>#{{ index + 1 }} {{ field.name || '新字段' }}</span>
                    <NButton
                      @click="removeField(index)"
                      size="tiny"
                      type="error"
                      quaternary
                      :disabled="editingTable.fields.length <= 1"
                    >
                      删除
                    </NButton>
                  </div>
                </template>

                <NGrid
                  :cols="2"
                  :x-gap="12"
                >
                  <NGi>
                    <NFormItem
                      label="字段名"
                      size="small"
                    >
                      <NInput
                        v-model:value="field.name"
                        placeholder="字段名"
                        size="small"
                      />
                    </NFormItem>
                  </NGi>
                  <NGi>
                    <NFormItem
                      label="类型"
                      size="small"
                    >
                      <NSelect
                        v-model:value="field.type"
                        :options="fieldTypes"
                        size="small"
                        filterable
                        placeholder="选择类型"
                      />
                    </NFormItem>
                  </NGi>
                </NGrid>

                <NSpace style="margin-top: 12px">
                  <NCheckbox
                    v-model:checked="field.isPrimaryKey"
                    @update:checked="handlePrimaryKey(field, $event)"
                  >
                    主键
                  </NCheckbox>
                  <NCheckbox v-model:checked="field.isRequired">必填</NCheckbox>
                  <NCheckbox v-model:checked="field.isForeignKey"
                    >外键</NCheckbox
                  >
                </NSpace>

                <NFormItem
                  label="注释"
                  size="small"
                  style="margin-top: 12px"
                >
                  <NInput
                    v-model:value="field.comment"
                    placeholder="字段注释"
                    size="small"
                  />
                </NFormItem>
              </NCard>

              <NButton
                @click="addField"
                dashed
                block
                type="primary"
                ghost
                style="margin-top: 16px"
              >
                <template #icon><div class="i-mdi:plus"></div></template>
                添加字段
              </NButton>
            </div>
          </NForm>
        </div>

        <template #footer>
          <NSpace justify="end">
            <NButton @click="showEditor = false">取消</NButton>
            <NButton
              @click="saveTable"
              type="primary"
              >保存</NButton
            >
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { Node, Graph, Cell, Edge } from '@antv/x6'
  import { useGraphBase } from '@/composables/AntV/useGraphBase'
  import { exportJSON } from '../../utils/exportUtils'
  import type {
    ERTable,
    ERField,
    ERDiagramData,
    ERRelation,
  } from '@/types/antv'
  import { fieldTypes, exportOptions } from './data'

  interface Props {
    data?: ERDiagramData
    showToolbar?: boolean
    readonly?: boolean
  }

  interface Emits {
    (e: 'ready', graph: Graph): void
    (e: 'data-change', data: ERDiagramData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    showToolbar: true,
    readonly: false,
  })

  const emit = defineEmits<Emits>()

  const containerRef = ref<HTMLDivElement>()
  const { graph, initGraph, centerContent, zoomToFit } =
    useGraphBase(containerRef)
  const showEditor = ref(false)
  const editingTable = ref<ERTable>()
  const deleteMode = ref(false)

  // 切换删除模式
  const toggleDeleteMode = () => {
    deleteMode.value = !deleteMode.value
    if (!deleteMode.value && graph.value) {
      // 退出删除模式时，恢复所有连接线样式
      graph.value
        .getEdges()
        .forEach(
          (edge: { attr: (arg0: string, arg1: string | number) => void }) => {
            edge.attr('line/stroke', '#A2B1C3')
            edge.attr('line/strokeWidth', 2)
          }
        )
    }
  }

  // 文本截断工具函数
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength - 1) + '..'
      : text
  }

  // 创建端口配置
  const createPortConfig = (table: ERTable) => {
    return (
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
    )
  }

  // 创建节点配置
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

  const registerNodes = () => {
    if (!graph.value) return

    Graph.registerPortLayout(
      'erPortPosition',
      portsPositionArgs => {
        return portsPositionArgs.map((_, index) => ({
          position: { x: 0, y: (index + 1) * 24 },
          angle: 0,
        }))
      },
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

  // 创建表节点
  const createTableNode = (table: ERTable) => {
    if (!graph.value) return
    const node = graph.value.createNode(createNodeConfig(table))
    graph.value.resetCells([node, ...graph.value.getCells()])
    return node
  }

  // 添加表
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

  // 找到合适位置
  const findPosition = () => {
    const nodes = graph.value?.getNodes() || []
    const spacing = 250

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 3; col++) {
        const pos = { x: col * spacing + 50, y: row * spacing + 50 }
        const hasOverlap = nodes.some((node: { getPosition: () => any }) => {
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

  // 编辑/保存表
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
      updateNode(node, editingTable.value)
    }

    showEditor.value = false
    emitDataChange()
  }

  // 更新节点
  const updateNode = (node: Node, table: ERTable) => {
    node.prop({
      size: { width: 200, height: 24 + table.fields.length * 24 },
      attrs: {
        label: {
          text: truncateText(table.name, 20),
          title: table.name,
        },
      },
      ports: createPortConfig(table),
    })
  }

  // 处理主键
  const handlePrimaryKey = (field: ERField, isPrimaryKey: boolean) => {
    if (!isPrimaryKey) return

    field.isRequired = true
    editingTable.value?.fields.forEach(f => {
      if (f !== field) f.isPrimaryKey = false
    })
  }

  // 添加/删除字段
  const addField = () => {
    editingTable.value?.fields.push({
      name: `field_${editingTable.value.fields.length + 1}`,
      type: 'VARCHAR(100)',
      isPrimaryKey: false,
      isRequired: false,
      isForeignKey: false,
      comment: '',
    })
  }

  const removeField = (index: number) => {
    if (editingTable.value && editingTable.value.fields.length > 1) {
      editingTable.value.fields.splice(index, 1)
    }
  }

  // 获取数据
  const getCurrentData = (): ERDiagramData => {
    if (!graph.value) return { tables: [], relations: [] }

    const tables = graph.value
      .getNodes()
      .map((node: { getData: () => any; getPosition: () => any }) => ({
        ...node.getData(),
        position: node.getPosition(),
      }))

    const relations: ERRelation[] = []
    graph.value
      .getEdges()
      .forEach(
        (edge: {
          getSourceNode: () => any
          getTargetNode: () => any
          getSourcePortId: () => any
          getTargetPortId: () => any
          id: any
        }) => {
          const source = edge.getSourceNode()
          const target = edge.getTargetNode()
          const sourcePort = edge.getSourcePortId()
          const targetPort = edge.getTargetPortId()

          if (source && target && sourcePort && targetPort) {
            const sourceField = sourcePort.split('_').slice(1).join('_')
            const targetField = targetPort.split('_').slice(1).join('_')

            relations.push({
              id: edge.id,
              type: 'foreign-key',
              sourceTable: source.id,
              sourceField,
              targetTable: target.id,
              targetField,
              name: `${source.getData()?.name || source.id}.${sourceField} -> ${target.getData()?.name || target.id}.${targetField}`,
            })
          }
        }
      )

    return { tables, relations }
  }

  // 导出 - 修复类型错误
  const handleExport = (key: string) => {
    if (!graph.value) {
      console.error('Graph is not initialized')
      return
    }

    const data = getCurrentData()

    switch (key) {
      case 'png':
      case 'svg':
        // 直接使用 graph 的内置导出方法（如果存在）
        const g = graph.value as any
        if (g.exportPNG && key === 'png') {
          g.exportPNG('er-diagram')
        } else if (g.exportSVG && key === 'svg') {
          g.exportSVG('er-diagram')
        } else if (g.toDataURL) {
          g.toDataURL((dataUri: string) => {
            const link = document.createElement('a')
            link.download = `er-diagram.${key}`
            link.href = dataUri
            link.click()
          }, key)
        }
        break
      case 'json':
        exportJSON(data)
        break
    }
  }

  const emitDataChange = () => emit('data-change', getCurrentData())

  // 初始化
  watch(
    graph,
    newGraph => {
      if (newGraph && newGraph instanceof Graph) {
        // 添加类型检查
        registerNodes()

        newGraph.on('node:dblclick', ({ node }) => {
          if (!props.readonly) editTable(node.getData() as ERTable)
        })

        newGraph.on('edge:connected', emitDataChange)
        newGraph.on('edge:removed', emitDataChange)

        let selectedEdge: Edge | null = null

        // 连接线点击事件
        newGraph.on('edge:click', ({ edge }) => {
          if (deleteMode.value) {
            // 删除模式下直接删除
            edge.remove()
            emitDataChange()
          } else {
            // 普通模式下高亮显示并设为选中
            newGraph.getEdges().forEach(e => {
              e.attr('line/stroke', '#A2B1C3')
              e.attr('line/strokeWidth', 2)
            })
            edge.attr('line/stroke', '#ff4d4f')
            edge.attr('line/strokeWidth', 3)
            selectedEdge = edge
          }
        })

        // 双击删除连接线
        newGraph.on('edge:dblclick', ({ edge }) => {
          edge.remove()
          emitDataChange()
        })

        // 点击空白处取消选中
        newGraph.on('blank:click', () => {
          selectedEdge = null
          if (!deleteMode.value) {
            newGraph.getEdges().forEach(edge => {
              edge.attr('line/stroke', '#A2B1C3')
              edge.attr('line/strokeWidth', 2)
            })
          }
        })

        // 键盘删除功能（只绑定一次）
        const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdge) {
            selectedEdge.remove()
            emitDataChange()
            selectedEdge = null
          }
        }
        document.addEventListener('keydown', handleKeyDown)

        // 清理事件监听器
        newGraph.on('graph:removed', () => {
          document.removeEventListener('keydown', handleKeyDown)
        })

        emit('ready', newGraph) // 现在 TypeScript 知道 newGraph 是 Graph 类型

        // 加载初始数据
        nextTick(() => {
          if (props.data?.tables) {
            const cells: Cell[] = props.data.tables.map(table =>
              newGraph.createNode(createNodeConfig(table))
            )
            newGraph.resetCells(cells)
            setTimeout(
              () => newGraph.zoomToFit({ padding: 20, maxScale: 1 }),
              300
            )
          }
        })
      }
    },
    { immediate: true }
  )

  // 监听数据变化
  watch(
    () => props.data,
    newData => {
      if (graph.value && newData?.tables) {
        const cells: Cell[] = newData.tables.map(table =>
          graph.value!.createNode(createNodeConfig(table))
        )
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
