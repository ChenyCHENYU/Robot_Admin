export const elementTypes = {
  'start-event': {
    name: '开始',
    title: '开始事件',
    iconClass: 'circle start-event',
  },
  activity: { name: '任务', title: '任务活动', iconClass: 'rect activity' },
  gateway: { name: '网关', title: '排他网关', iconClass: 'diamond gateway' },
  'end-event': {
    name: '结束',
    title: '结束事件',
    iconClass: 'circle end-event',
  },
}

export const elementTypeNames = {
  event: '事件',
  activity: '活动',
  gateway: '网关',
  'bpmn-edge': '连接线',
}

// 端口位置配置
export const portPositions = ['top', 'right', 'bottom', 'left']

// 端口属性配置函数
export const createPortAttrs = (
  positions: string[],
  nodeType: 'circle' | 'rect' | 'polygon' = 'rect'
) =>
  positions.reduce((acc, pos) => {
    const isCircle = nodeType === 'circle'
    const refConfig =
      pos === 'top'
        ? isCircle
          ? { refCx: 0.5, refCy: 0 }
          : { refX: 0.5, refY: 0 }
        : pos === 'right'
          ? isCircle
            ? { refCx: 1, refCy: 0.5 }
            : { refX: 1, refY: 0.5 }
          : pos === 'bottom'
            ? isCircle
              ? { refCx: 0.5, refCy: 1 }
              : { refX: 0.5, refY: 1 }
            : isCircle
              ? { refCx: 0, refCy: 0.5 }
              : { refX: 0, refY: 0.5 }

    acc[`port-${pos}`] = {
      ref: 'body',
      ...refConfig,
      r: 4,
      fill: '#31d0c6',
      stroke: '#ffffff',
      strokeWidth: 2,
      magnet: true,
      style: { cursor: 'crosshair', opacity: 0, transition: 'opacity 0.2s' },
    }
    return acc
  }, {} as any)

// 节点配置
export const nodeConfigs = {
  event: {
    inherit: 'circle',
    attrs: {
      body: {
        strokeWidth: 2,
        stroke: '#5F95FF',
        fill: '#FFF',
        magnet: false,
        style: { cursor: 'move' },
      },
      text: {
        fontSize: 12,
        fill: '#262626',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        pointerEvents: 'none',
      },
    },
  },
  activity: {
    inherit: 'rect',
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        stroke: '#5F95FF',
        fill: '#EFF4FF',
        strokeWidth: 1,
        magnet: false,
        style: { cursor: 'move' },
      },
      text: {
        fontSize: 12,
        fill: '#262626',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        pointerEvents: 'none',
      },
    },
  },
  gateway: {
    inherit: 'polygon',
    attrs: {
      body: {
        refPoints: '0,10 10,0 20,10 10,20',
        strokeWidth: 2,
        stroke: '#5F95FF',
        fill: '#EFF4FF',
        magnet: false,
        style: { cursor: 'move' },
      },
      text: {
        fontSize: 20,
        fill: '#5F95FF',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        pointerEvents: 'none',
      },
    },
  },
}

// 边配置
export const edgeConfig = {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: '#A2B1C3',
      strokeWidth: 2,
      targetMarker: {
        name: 'block',
        width: 8,
        height: 6,
        fill: '#A2B1C3',
      },
      cursor: 'pointer',
    },
  },
}

// 图形配置 - 支持主题切换
/**
 * 获取图形配置（支持主题切换）
 * @param isDark 是否为暗色主题
 * @returns Graph配置对象
 */
export function getGraphConfig(isDark = false) {
  const themeColors = {
    background: isDark ? '#18181c' : '#ffffff',
    gridPrimary: isDark ? 'rgba(255, 255, 255, 0.08)' : '#eee',
    gridSecondary: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ddd',
  }

  return {
    background: { color: themeColors.background },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        { color: themeColors.gridPrimary, thickness: 1 },
        { color: themeColors.gridSecondary, thickness: 1, factor: 4 },
      ],
    },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: 'manhattan',
      connector: { name: 'rounded', args: { radius: 8 } },
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      snap: true,
      allowEdge: false,
    },
    highlighting: {
      magnetAvailable: {
        name: 'stroke',
        args: { attrs: { fill: '#31d0c6', stroke: '#31d0c6', opacity: 1 } },
      },
      magnetAdsorbed: {
        name: 'stroke',
        args: { attrs: { fill: '#5F95FF', stroke: '#5F95FF', opacity: 1 } },
      },
    },
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    resizing: true,
    rotating: false,
    snapline: true,
    keyboard: true,
    clipboard: true,
  }
}

// 保持向后兼容
export const graphConfig = getGraphConfig()

// 添加元素配置
export const addElementConfigs = {
  'start-event': {
    shape: 'event',
    width: 50,
    height: 50,
    label: '开始事件',
    data: { type: 'start' },
  },
  'end-event': {
    shape: 'event',
    width: 50,
    height: 50,
    label: '结束事件',
    data: { type: 'end' },
  },
  activity: {
    shape: 'activity',
    width: 120,
    height: 60,
    label: '新活动',
    data: { description: '', assignee: '' },
  },
  gateway: {
    shape: 'gateway',
    width: 40,
    height: 40,
    label: '+',
    data: { type: 'exclusive' },
  },
}

// 示例数据
export const sampleData = [
  {
    id: 'start-1',
    shape: 'event',
    x: 100,
    y: 200,
    width: 50,
    height: 50,
    label: '流程开始',
    data: { type: 'start' },
  },
  {
    id: 'activity-1',
    shape: 'activity',
    x: 200,
    y: 180,
    width: 120,
    height: 60,
    label: '用户申请',
    data: { description: '用户提交申请表单', assignee: '申请人' },
  },
  {
    id: 'activity-2',
    shape: 'activity',
    x: 380,
    y: 180,
    width: 120,
    height: 60,
    label: '初审',
    data: { description: '部门进行初步审核', assignee: '部门主管' },
  },
  {
    id: 'gateway-1',
    shape: 'gateway',
    x: 550,
    y: 200,
    width: 40,
    height: 40,
    label: '+',
    data: { type: 'exclusive' },
  },
  {
    id: 'activity-3',
    shape: 'activity',
    x: 650,
    y: 120,
    width: 120,
    height: 60,
    label: '终审',
    data: { description: '高级主管最终审核', assignee: '总监' },
  },
  {
    id: 'activity-4',
    shape: 'activity',
    x: 650,
    y: 260,
    width: 120,
    height: 60,
    label: '驳回处理',
    data: { description: '处理驳回流程', assignee: '专员' },
  },
  {
    id: 'end-1',
    shape: 'event',
    x: 820,
    y: 140,
    width: 50,
    height: 50,
    label: '审批通过',
    data: { type: 'end' },
  },
  {
    id: 'end-2',
    shape: 'event',
    x: 820,
    y: 280,
    width: 50,
    height: 50,
    label: '审批驳回',
    data: { type: 'end' },
  },
  {
    id: 'edge-1',
    shape: 'bpmn-edge',
    source: 'start-1',
    target: 'activity-1',
    x: 0,
    y: 0,
  },
  {
    id: 'edge-2',
    shape: 'bpmn-edge',
    source: 'activity-1',
    target: 'activity-2',
    x: 0,
    y: 0,
  },
  {
    id: 'edge-3',
    shape: 'bpmn-edge',
    source: 'activity-2',
    target: 'gateway-1',
    x: 0,
    y: 0,
  },
  {
    id: 'edge-4',
    shape: 'bpmn-edge',
    source: 'gateway-1',
    target: 'activity-3',
    label: '通过',
    x: 0,
    y: 0,
  },
  {
    id: 'edge-5',
    shape: 'bpmn-edge',
    source: 'gateway-1',
    target: 'activity-4',
    label: '驳回',
    x: 0,
    y: 0,
  },
  {
    id: 'edge-6',
    shape: 'bpmn-edge',
    source: 'activity-3',
    target: 'end-1',
    x: 0,
    y: 0,
  },
  {
    id: 'edge-7',
    shape: 'bpmn-edge',
    source: 'activity-4',
    target: 'end-2',
    x: 0,
    y: 0,
  },
]
