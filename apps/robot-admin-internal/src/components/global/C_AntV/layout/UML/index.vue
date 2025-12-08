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
          @select="handleExport"
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

    <NDrawer
      v-model:show="showEditor"
      width="450"
      title="编辑类"
    >
      <div
        v-if="editingClass"
        class="class-editor"
      >
        <NForm label-placement="top">
          <NFormItem label="类名">
            <NInput
              v-model:value="editingClass.name"
              placeholder="请输入类名"
            />
          </NFormItem>

          <NDivider style="margin: 20px 0">属性</NDivider>
          <div class="section">
            <div
              v-for="(attr, index) in editingClass.attributes"
              :key="index"
              class="item"
            >
              <NCard
                size="small"
                style="margin-bottom: 12px"
              >
                <template #header>
                  <div
                    style="
                      display: flex;
                      justify-content: between;
                      align-items: center;
                    "
                  >
                    <span style="font-size: 13px"
                      >#{{ index + 1 }} {{ attr.name || '新属性' }}</span
                    >
                    <NButton
                      @click="editingClass.attributes.splice(index, 1)"
                      size="tiny"
                      type="error"
                      quaternary
                      style="margin-left: auto"
                      >删除</NButton
                    >
                  </div>
                </template>
                <NSpace
                  vertical
                  size="small"
                >
                  <NSpace>
                    <NFormItem
                      label="属性名"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="attr.name"
                        placeholder="属性名"
                        size="small"
                      />
                    </NFormItem>
                    <NFormItem
                      label="类型"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="attr.type"
                        placeholder="类型"
                        size="small"
                      />
                    </NFormItem>
                  </NSpace>
                  <NFormItem
                    label="可见性"
                    style="margin: 0"
                  >
                    <NRadioGroup
                      v-model:value="attr.visibility"
                      size="small"
                    >
                      <NRadio value="public">+ public</NRadio>
                      <NRadio value="private">- private</NRadio>
                      <NRadio value="protected"># protected</NRadio>
                    </NRadioGroup>
                  </NFormItem>
                </NSpace>
              </NCard>
            </div>
            <NButton
              @click="
                editingClass.attributes.push({
                  name: 'newAttribute',
                  type: 'string',
                  visibility: 'private',
                })
              "
              dashed
              block
              type="primary"
              ghost
              size="small"
            >
              <template #icon><div class="i-mdi-plus"></div></template>
              添加属性
            </NButton>
          </div>

          <NDivider style="margin: 20px 0">方法</NDivider>
          <div class="section">
            <div
              v-for="(method, index) in editingClass.methods"
              :key="index"
              class="item"
            >
              <NCard
                size="small"
                style="margin-bottom: 12px"
              >
                <template #header>
                  <div
                    style="
                      display: flex;
                      justify-content: between;
                      align-items: center;
                    "
                  >
                    <span style="font-size: 13px"
                      >#{{ index + 1 }} {{ method.name || '新方法' }}</span
                    >
                    <NButton
                      @click="editingClass.methods.splice(index, 1)"
                      size="tiny"
                      type="error"
                      quaternary
                      style="margin-left: auto"
                      >删除</NButton
                    >
                  </div>
                </template>
                <NSpace
                  vertical
                  size="small"
                >
                  <NSpace>
                    <NFormItem
                      label="方法名"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="method.name"
                        placeholder="方法名"
                        size="small"
                      />
                    </NFormItem>
                    <NFormItem
                      label="返回类型"
                      style="margin: 0; flex: 1"
                    >
                      <NInput
                        v-model:value="method.returnType"
                        placeholder="返回类型"
                        size="small"
                      />
                    </NFormItem>
                  </NSpace>
                  <NFormItem
                    label="可见性"
                    style="margin: 0"
                  >
                    <NRadioGroup
                      v-model:value="method.visibility"
                      size="small"
                    >
                      <NRadio value="public">+ public</NRadio>
                      <NRadio value="private">- private</NRadio>
                      <NRadio value="protected"># protected</NRadio>
                    </NRadioGroup>
                  </NFormItem>
                </NSpace>
              </NCard>
            </div>
            <NButton
              @click="
                editingClass.methods.push({
                  name: 'newMethod',
                  returnType: 'void',
                  visibility: 'public',
                })
              "
              dashed
              block
              type="primary"
              ghost
              size="small"
            >
              <template #icon><div class="i-mdi-plus"></div></template>
              添加方法
            </NButton>
          </div>

          <NDivider style="margin: 20px 0"></NDivider>
          <NSpace justify="space-between">
            <NButton
              @click="deleteClass"
              type="error"
              ghost
            >
              <template #icon><div class="i-mdi-delete"></div></template>
              删除类
            </NButton>
            <NSpace>
              <NButton @click="showEditor = false">取消</NButton>
              <NButton
                @click="saveClass"
                type="primary"
                >保存</NButton
              >
            </NSpace>
          </NSpace>
        </NForm>
      </div>
    </NDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { Graph, ObjectExt, type Node, type Cell } from '@antv/x6'
  import { exportJSON, exportPNG, exportSVG } from '../../utils/exportUtils'
  import type { UMLClass, UMLDiagramData } from '@/types/antv'
  import {
    exportOptions,
    edgeTypes,
    classNodeConfig,
    graphConfig,
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

  const containerRef = ref<HTMLDivElement>()
  const graph = ref<Graph>()
  const showEditor = ref(false)
  const editingClass = ref<UMLClass>()

  const centerContent = () => graph.value?.centerContent()
  const zoomToFit = () => graph.value?.zoomToFit({ padding: 10, maxScale: 1 })

  const initGraph = (options: any = {}) => {
    if (!containerRef.value) return
    graph.value = new Graph({
      container: containerRef.value,
      width: containerRef.value.clientWidth,
      height: containerRef.value.clientHeight,
      ...graphConfig,
      ...options,
    })
  }

  const registerNodes = () => {
    // 注册UML类节点
    Graph.registerNode(
      'class',
      {
        ...classNodeConfig,
        /**
         * @description: 节点事件
         */
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

    // 注册连线类型
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

  const initializeGraph = () => {
    if (!graph.value) return

    // 绑定事件
    graph.value.on('node:dblclick', ({ node }: { node: Node }) => {
      if (!props.readonly && node.getData()) editClass(node.getData())
    })

    // 连接点显示/隐藏
    const togglePorts = (node: Node, opacity: number) => {
      ;['top', 'right', 'bottom', 'left'].forEach(pos =>
        node.attr(`port-${pos}/style/opacity`, opacity)
      )
    }

    graph.value.on('node:mouseenter', ({ node }) => togglePorts(node, 1))
    graph.value.on('node:mouseleave', ({ node }) => togglePorts(node, 0))
    graph.value.on('edge:connected', () => emitDataChange())

    // 连接线点击变红
    graph.value.on('edge:click', ({ edge }) => {
      // 恢复所有边的颜色
      graph.value!.getEdges().forEach(e => {
        e.attr('line/stroke', '#722ed1')
      })
      // 当前边变红
      edge.attr('line/stroke', '#ff4d4f')
    })

    // 双击删除连接线
    graph.value.on('edge:dblclick', ({ edge }) => {
      edge.remove()
      emitDataChange()
    })

    // 点击空白处或节点时恢复所有边颜色
    graph.value.on('blank:click', () => {
      graph.value!.getEdges().forEach(edge => {
        edge.attr('line/stroke', '#722ed1')
      })
    })

    graph.value.on('node:click', () => {
      graph.value!.getEdges().forEach(edge => {
        edge.attr('line/stroke', '#722ed1')
      })
    })

    emit('ready', graph.value)

    // 加载示例数据
    const defaultCells = [
      ...sampleClasses.map(cls => ({
        id: cls.id,
        shape: 'class',
        x: cls.x,
        y: cls.y,
        name: cls.name,
        attributes: cls.attributes.map(
          attr =>
            `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
        ),
        methods: cls.methods.map(
          method =>
            `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
        ),
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
  }

  const addClass = () => {
    const newClass: UMLClass = {
      id: `class_${Date.now()}`,
      ...newClassTemplate,
    }

    if (!graph.value) return

    const nodeData = {
      id: newClass.id,
      shape: 'class',
      x: newClass.position.x,
      y: newClass.position.y,
      name: newClass.name,
      attributes: newClass.attributes.map(
        attr =>
          `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
      ),
      methods: newClass.methods.map(
        method =>
          `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
      ),
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
      node.prop({
        name: editingClass.value.name,
        attributes: editingClass.value.attributes.map(
          attr =>
            `${getVisibilitySymbol(attr.visibility)} ${attr.name}: ${attr.type}`
        ),
        methods: editingClass.value.methods.map(
          method =>
            `${getVisibilitySymbol(method.visibility)} ${method.name}(): ${method.returnType}`
        ),
      })
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

  const getCurrentData = (): UMLDiagramData => ({
    classes:
      graph.value?.getNodes().map((node: Node) => ({
        ...node.getData(),
        position: node.getPosition(),
      })) || [],
    relations: [],
  })

  const handleExport = (key: string) => {
    if (!graph.value) return
    const data = getCurrentData()
    const exportMap = {
      png: () => exportPNG(graph.value!),
      svg: () => exportSVG(graph.value!),
      json: () => exportJSON(data),
    }
    exportMap[key as keyof typeof exportMap]?.()
  }

  const emitDataChange = () => emit('data-change', getCurrentData())

  watch(
    graph,
    newGraph => {
      if (newGraph) {
        registerNodes()
        initializeGraph()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.data,
    newData => {
      if (graph.value && newData) {
        // 处理外部数据变化
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

<style lang="scss">
  // 非 scoped 样式 - 专门处理抽屉样式
  .class-editor {
    padding: 20px;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .section {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d4d4d4;
      border-radius: 3px;
    }
  }

  .item {
    margin-bottom: 8px;
  }

  .section .n-card {
    border: 1px solid #e8e8e8;
  }

  .section .n-card-header {
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
  }

  .section .n-card__content {
    padding: 12px;
  }

  .section .n-form-item {
    margin-bottom: 0;
  }

  .section .n-form-item-label {
    font-size: 12px;
    margin-bottom: 4px;
    color: #666;
  }
</style>
