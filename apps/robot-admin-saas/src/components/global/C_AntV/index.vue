<template>
  <div class="c-antv-container">
    <component
      :is="currentComponent"
      v-bind="componentProps"
      @ready="handleReady"
      @data-change="handleDataChange"
      ref="layoutRef"
    />
  </div>
</template>

<script setup lang="ts">
  import ERLayout from './layout/ER/index.vue'
  import BPMNLayout from './layout/BPMN/index.vue'
  import UMLLayout from './layout/UML/index.vue'
  import type { DiagramConfig, DiagramData } from '@/types/antv'

  interface Props extends DiagramConfig {
    type: 'er' | 'bpmn' | 'uml'
    data?: DiagramData
    width?: string | number
    height?: string | number
    readonly?: boolean
    showToolbar?: boolean
    theme?: 'light' | 'dark'
  }

  const props = withDefaults(defineProps<Props>(), {
    width: '100%',
    height: '600px',
    readonly: false,
    showToolbar: true,
    theme: 'light',
  })

  const emit = defineEmits<{
    (e: 'ready', graph: any): void
    (e: 'data-change', data: DiagramData): void
  }>()

  const layoutRef = ref()

  const components = {
    er: ERLayout,
    bpmn: BPMNLayout,
    uml: UMLLayout,
  } as const

  const currentComponent = computed(() => {
    const component = components[props.type]
    console.log(`[C_AntV] 当前组件类型: ${props.type}`, component ? '✅' : '❌')
    return component
  })

  const componentProps = computed(() => {
    const baseProps = {
      width: props.width,
      height: props.height,
      readonly: props.readonly,
      showToolbar: props.showToolbar,
      theme: props.theme,
    }

    // 处理 BPMN 数据格式转换
    let adaptedData: any = props.data

    if (props.type === 'bpmn' && props.data) {
      // 检查是否为 BPMNDiagramData 格式
      const bpmnData = props.data as any
      if (
        bpmnData &&
        typeof bpmnData === 'object' &&
        'nodes' in bpmnData &&
        'edges' in bpmnData
      ) {
        // 转换为 BPMNLayout 期望的 BPMNElement[] 格式
        adaptedData = [
          ...(bpmnData.nodes || []).map((node: any) => ({
            ...node,
            shape: node.type || node.shape || 'rect',
            x: node.x ?? 0,
            y: node.y ?? 0,
          })),
          ...(bpmnData.edges || []).map((edge: any) => ({
            ...edge,
            shape: 'edge',
            x: 0,
            y: 0,
          })),
        ]
      }
    }

    const result = {
      ...baseProps,
      data: adaptedData,
    }

    console.log(`[C_AntV] 传递给${props.type}组件的属性:`, result)
    return result as any // 使用类型断言避免类型检查
  })

  const handleReady = (graph: any) => {
    console.log(`[C_AntV] ${props.type}图表准备就绪:`, graph)
    emit('ready', graph)
  }

  const handleDataChange = (data: any) => {
    console.log(`[C_AntV] ${props.type}数据变化:`, data)

    let convertedData: DiagramData

    if (props.type === 'bpmn' && Array.isArray(data)) {
      // 将 BPMNElement[] 转换回 BPMNDiagramData 格式，包含必需的 flows 属性
      const nodes = data
        .filter((item: any) => item.shape !== 'edge')
        .map((item: any) => {
          const { shape, x, y, ...node } = item
          return {
            ...node,
            type: shape === 'rect' ? 'task' : shape,
            x: x || 0,
            y: y || 0,
          }
        })

      const edges = data
        .filter((item: any) => item.shape === 'edge')
        .map((item: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { shape, x, y, ...edge } = item
          return edge
        })

      // 创建完整的 BPMNDiagramData 对象，包含必需的 flows 属性
      convertedData = {
        nodes,
        edges,
        flows: [], // 添加必需的 flows 属性，根据实际需求填充
      } as unknown as DiagramData // 使用双重断言确保类型转换
    } else {
      convertedData = data as DiagramData
    }

    emit('data-change', convertedData)
  }

  // 监听类型变化
  watch(
    () => props.type,
    (newType, oldType) => {
      console.log(`[C_AntV] 图表类型从 ${oldType} 变更为 ${newType}`)
    },
    { immediate: true }
  )

  // 监听数据变化
  watch(
    () => props.data,
    newData => {
      console.log(`[C_AntV] 数据变化:`, newData)
    },
    { deep: true }
  )

  defineExpose({
    getGraph: () => {
      console.log(`[C_AntV] 获取${props.type}图表实例`)
      return layoutRef.value?.getGraph?.()
    },
    getData: () => {
      console.log(`[C_AntV] 获取${props.type}数据`)
      const rawData = layoutRef.value?.getData?.()

      // 根据组件类型转换回标准格式
      if (props.type === 'bpmn' && Array.isArray(rawData)) {
        const nodes = rawData.filter((item: any) => item.shape !== 'edge')
        const edges = rawData.filter((item: any) => item.shape === 'edge')

        return {
          nodes,
          edges,
          flows: [], // 确保包含 flows 属性
        } as unknown as DiagramData
      }

      return rawData
    },
  })
</script>

<style scoped>
  .c-antv-container {
    width: 100%;
    height: 100%;
  }
</style>
