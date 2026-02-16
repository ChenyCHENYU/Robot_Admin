import type { Ref } from 'vue'
import type { Graph, Node } from '@antv/x6'

export interface EdgeInteractionOptions {
  /** 连线默认颜色 */
  defaultColor?: string
  /** 连线高亮颜色 */
  highlightColor?: string
  /** 默认线宽 */
  strokeWidth?: number
  /** 高亮线宽 */
  highlightStrokeWidth?: number
  /** 端口位置名称列表（用于控制 mouseenter/leave 显隐） */
  portPositions?: string[]
  /** 数据变更回调 */
  onDataChange?: () => void
}

const DEFAULT_OPTIONS: Required<EdgeInteractionOptions> = {
  defaultColor: '#A2B1C3',
  highlightColor: '#ff4d4f',
  strokeWidth: 2,
  highlightStrokeWidth: 3,
  portPositions: [],
  onDataChange: () => {},
}

/**
 * 图表交互 composable — 统一管理连线点击/高亮/删除 + 端口显隐
 * @param graph - X6 Graph 实例引用
 * @param options - 交互配置
 */
export function useEdgeInteraction(
  graph: Ref<Graph | null>,
  options: EdgeInteractionOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  /** 重置所有连线颜色 */
  const resetEdgeStyles = () => {
    graph.value?.getEdges().forEach(edge => {
      edge.attr('line/stroke', config.defaultColor)
      edge.attr('line/strokeWidth', config.strokeWidth)
    })
  }

  /** 高亮指定连线 */
  const highlightEdge = (edge: any) => {
    resetEdgeStyles()
    edge.attr('line/stroke', config.highlightColor)
    edge.attr('line/strokeWidth', config.highlightStrokeWidth)
  }

  /** 切换端口可见性 */
  const togglePorts = (node: Node, opacity: number) => {
    config.portPositions.forEach(pos =>
      node.attr(`port-${pos}/style/opacity`, opacity)
    )
  }

  /**
   * 绑定标准交互事件到 graph 实例
   * - edge:click → 高亮
   * - edge:dblclick → 删除
   * - blank:click / node:click → 重置颜色
   * - node:mouseenter / mouseleave → 端口显隐（如配置了 portPositions）
   */
  const bindInteractions = () => {
    const g = graph.value
    if (!g) return

    // 连线点击高亮
    g.on('edge:click', ({ edge }) => highlightEdge(edge))

    // 连线双击删除
    g.on('edge:dblclick', ({ edge }) => {
      edge.remove()
      config.onDataChange()
    })

    // 点击空白 / 节点时重置颜色
    g.on('blank:click', resetEdgeStyles)
    g.on('node:click', resetEdgeStyles)

    // 连线创建时通知数据变更
    g.on('edge:connected', config.onDataChange)

    // 端口显隐（如果配置了 portPositions）
    if (config.portPositions.length > 0) {
      g.on('node:mouseenter', ({ node }) => togglePorts(node, 1))
      g.on('node:mouseleave', ({ node }) => togglePorts(node, 0))
    }
  }

  return { resetEdgeStyles, highlightEdge, togglePorts, bindInteractions }
}
