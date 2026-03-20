/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 08:18:54
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 09:01:11
 * @FilePath: \Robot_Admin\src\views\demo\23-drag-direct\data.ts
 * @Description: 拖拽指令演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description 基础用法代码示例
 * ! @return 基础用法的代码字符串
 */
export function getBasicCode(): string {
  return `<!-- 启用拖拽 -->
<div v-drag="true">
  <p>可以拖拽的元素</p>
</div>

<!-- 使用默认配置 -->
<div v-drag>
  <p>默认拖拽配置</p>
</div>

<!-- 禁用拖拽 -->
<div v-drag="false">
  <p>禁用拖拽的元素</p>
</div>`
}

/**
 * * @description 样式配置代码示例
 * ! @return 样式配置的代码字符串
 */
export function getStyleCode(): string {
  return `<!-- 指定拖拽手柄 -->
<div v-drag="{
  handle: '.drag-handle'
}">
  <div class="drag-handle">拖拽手柄</div>
  <p>内容区域</p>
</div>

<!-- 边界限制和轴限制 -->
<div v-drag="{
  boundary: '.container',
  axis: 'x'
}">
  <p>只能在X轴拖拽</p>
</div>

<!-- 网格对齐 -->
<div v-drag="{
  grid: [20, 20],
  cursor: 'crosshair'
}">
  <p>网格对齐拖拽</p>
</div>`
}

/**
 * * @description 高级配置代码示例
 * ! @return 高级配置的代码字符串
 */
export function getAdvancedCode(): string {
  const scriptStart = '<script setup>'
  const scriptEnd = '</' + 'script>'

  return `${scriptStart}
// 拖拽配置
const dragEnabled = ref(true)
const dragAxis = ref('both')

// 回调函数
const handleDragStart = (el, event) => {
  console.log('开始拖拽:', el)
}

const handleDragMove = (el, event, position) => {
  console.log('拖拽中:', position)
}

const handleDragEnd = (el, event, position) => {
  console.log('拖拽结束:', position)
}
${scriptEnd}

<!-- 动态配置 -->
<div v-drag="{
  disabled: !dragEnabled,
  axis: dragAxis,
  threshold: 5,
  onStart: handleDragStart,
  onDrag: handleDragMove,
  onEnd: handleDragEnd
}">
  <p>动态配置拖拽</p>
</div>`
}

/**
 * * @description 场景示例代码
 * ! @return 场景示例的代码字符串
 */
export function getScenarioCode(): string {
  return `<!-- 卡片拖拽 -->
<div v-drag="{
  boundary: '.container',
  onEnd: updateCardPosition
}" class="card">
  <h3>拖拽卡片</h3>
  <p>卡片内容...</p>
</div>

<!-- 列表排序 -->
<div v-for="item in list"
     v-drag="{
       axis: 'y',
       grid: [1, 60]
     }"
     class="list-item">
  {{ item.name }}
</div>

<!-- 画布元素 -->
<div v-for="shape in shapes"
     v-drag="{
       boundary: '.canvas',
       onDrag: updateShapePosition
     }"
     class="shape">
  {{ shape.label }}
</div>`
}

/**
 * * @description 轴选项配置
 */
export const axisOptions = [
  { label: '全方向', value: 'both' },
  { label: '仅X轴', value: 'x' },
  { label: '仅Y轴', value: 'y' },
]

/**
 * * @description 卡片数据
 */
export const cardList = reactive([
  {
    id: 1,
    title: '项目计划',
    content: '制定详细的项目开发计划和时间表',
    color: '#ff6b6b',
  },
  {
    id: 2,
    title: '需求分析',
    content: '分析用户需求和功能规格说明',
    color: '#4ecdc4',
  },
  {
    id: 3,
    title: '技术选型',
    content: '确定技术栈和开发工具',
    color: '#45b7d1',
  },
])

/**
 * * @description 可排序列表数据
 */
export const sortableList = reactive([
  {
    id: 1,
    name: '首页设计',
    description: '设计首页布局和交互效果',
  },
  {
    id: 2,
    name: '用户登录',
    description: '实现用户注册和登录功能',
  },
  {
    id: 3,
    name: '数据管理',
    description: '建立数据库和数据管理系统',
  },
  {
    id: 4,
    name: '接口开发',
    description: '开发前后端交互接口',
  },
  {
    id: 5,
    name: '测试部署',
    description: '进行功能测试和系统部署',
  },
])

/**
 * * @description 画布形状数据
 */
export const canvasShapes = reactive([
  {
    id: 1,
    type: 'circle',
    label: '圆形',
    x: 50,
    y: 50,
    color: '#ff6b6b',
  },
  {
    id: 2,
    type: 'square',
    label: '方形',
    x: 150,
    y: 100,
    color: '#4ecdc4',
  },
  {
    id: 3,
    type: 'circle',
    label: '圆形',
    x: 100,
    y: 150,
    color: '#45b7d1',
  },
])
