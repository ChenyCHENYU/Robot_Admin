<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 08:18:34
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 10:44:54
 * @FilePath: \Robot_Admin\src\views\demo\23-drag-direct\index.vue
 * @Description: 拖拽指令演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="drag-demo-page">
    <c_vTitle
      title="v-drag 拖拽指令场景示例"
      icon="mdi:drag-variant"
      description="通过 v-drag 指令让任意元素支持自由拖拽，支持约束轴向与边界限制"
    />
    <NGrid
      :cols="2"
      :x-gap="24"
      :y-gap="16"
    >
      <!-- 左侧演示区 -->
      <NGridItem>
        <NSpace
          vertical
          size="large"
        >
          <!-- 基础拖拽演示 -->
          <NCard
            title="基础拖拽演示"
            size="small"
          >
            <div class="demo-container">
              <div
                v-drag="true"
                class="drag-box"
                style="
                  left: 20px;
                  top: 20px;
                  background-color: #18a058;
                  color: white;
                "
              >
                基础拖拽
              </div>

              <div
                v-drag
                class="drag-box"
                style="
                  left: 160px;
                  top: 20px;
                  background-color: #2080f0;
                  color: white;
                "
              >
                默认配置
              </div>
            </div>
            <NDivider />
            <NText depth="3">最简单的使用方式，支持布尔值和默认配置</NText>
          </NCard>

          <!-- 样式自定义演示 -->
          <NCard
            title="样式自定义演示"
            size="small"
          >
            <div class="demo-container">
              <div
                v-drag="{
                  handle: '.drag-handle',
                }"
                class="drag-box"
                style="
                  left: 20px;
                  top: 20px;
                  background-color: #f0a020;
                  color: white;
                "
              >
                <div
                  class="drag-handle"
                  style="
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    padding: 4px;
                    cursor: grab;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                  "
                >
                  ⋮⋮
                </div>
                拖拽手柄
              </div>

              <div
                v-drag="{
                  boundary: '.demo-container',
                  axis: 'x',
                }"
                class="drag-box"
                style="
                  left: 180px;
                  top: 20px;
                  background-color: #d03050;
                  color: white;
                "
              >
                X轴拖拽
              </div>

              <div
                v-drag="{
                  grid: [20, 20],
                }"
                class="drag-box"
                style="
                  left: 20px;
                  top: 120px;
                  background-color: #7c3aed;
                  color: white;
                "
              >
                网格对齐
              </div>
            </div>
            <NDivider />
            <NText depth="3"
              >支持拖拽手柄、边界限制、轴限制、网格对齐等配置</NText
            >
          </NCard>

          <!-- 动态内容演示 -->
          <NCard
            title="动态内容演示"
            size="small"
          >
            <NSpace>
              <NSwitch v-model:value="dragEnabled" />
              <NText>启用拖拽</NText>

              <NSelect
                v-model:value="dragAxis"
                :options="axisOptions"
                style="width: 120px"
                class="mt--6px"
              />

              <NInputNumber
                v-model:value="gridSize"
                :min="1"
                :max="50"
                placeholder="网格大小"
                style="width: 120px"
                class="mt--6px"
              />
            </NSpace>

            <div class="demo-container">
              <div
                v-drag="{
                  disabled: !dragEnabled,
                  axis: dragAxis,
                  grid: [gridSize, gridSize],
                  onStart: handleDragStart,
                  onDrag: handleDragMove,
                  onEnd: handleDragEnd,
                }"
                class="drag-box"
                style="
                  left: 20px;
                  top: 20px;
                  background-color: #059669;
                  color: white;
                "
              >
                动态配置
              </div>
            </div>

            <NSpace>
              <NTag>拖拽状态: {{ dragStatus }}</NTag>
              <NTag type="info">拖拽次数: {{ dragCount }}</NTag>
              <NTag
                type="success"
                v-if="lastPosition"
              >
                位置: ({{ Math.round(lastPosition.x) }},
                {{ Math.round(lastPosition.y) }})
              </NTag>
            </NSpace>
            <NDivider />
            <NText depth="3">支持响应式配置和回调函数</NText>
          </NCard>

          <!-- 应用场景演示 -->
          <NCard
            title="应用场景演示"
            size="small"
          >
            <NTabs
              v-model:value="scenarioTab"
              type="line"
              size="small"
            >
              <NTabPane
                name="cards"
                tab="卡片拖拽"
              >
                <div class="demo-container cards-container">
                  <div
                    v-for="card in cardList"
                    :key="card.id"
                    v-drag="{
                      boundary: '.cards-container',
                      onEnd: (el: HTMLElement, position: any) =>
                        updateCardPosition(card.id, position),
                    }"
                    class="drag-card"
                    :style="{ backgroundColor: card.color }"
                  >
                    <h4>{{ card.title }}</h4>
                    <p>{{ card.content }}</p>
                    <div class="card-actions">
                      <NButton size="tiny">编辑</NButton>
                      <NButton
                        size="tiny"
                        type="primary"
                        >查看</NButton
                      >
                    </div>
                  </div>
                </div>
              </NTabPane>

              <NTabPane
                name="list"
                tab="列表排序"
              >
                <div class="demo-container list-container">
                  <div
                    v-for="(item, index) in sortableList"
                    :key="item.id"
                    v-drag="{
                      axis: 'y',
                      boundary: '.list-container',
                      grid: [1, 70],
                    }"
                    class="drag-list-item"
                    :style="{
                      left: '0px',
                      top: index * 70 + 10 + 'px',
                      backgroundColor: '#fff',
                    }"
                  >
                    <div style="margin-right: 12px; color: #999">⋮⋮</div>
                    <div style="flex: 1">
                      <div style="font-weight: 500">{{ item.name }}</div>
                      <div style="font-size: 12px; color: #999">{{
                        item.description
                      }}</div>
                    </div>
                    <div
                      style="
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: #f0f0f0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                      "
                    >
                      {{ index + 1 }}
                    </div>
                  </div>
                </div>
              </NTabPane>

              <NTabPane
                name="canvas"
                tab="画布元素"
              >
                <div class="demo-container canvas-container">
                  <div
                    v-for="shape in canvasShapes"
                    :key="shape.id"
                    v-drag="{
                      boundary: '.canvas-container',
                      onDrag: (el: HTMLElement, position: any) =>
                        updateShapePosition(shape.id, position),
                    }"
                    class="canvas-shape"
                    :class="shape.type"
                    :style="{
                      left: shape.x + 'px',
                      top: shape.y + 'px',
                      backgroundColor: shape.color,
                    }"
                  >
                    <span>{{ shape.label }}</span>
                  </div>

                  <div class="canvas-toolbar">
                    <C_ActionBar
                      :actions="canvasActions"
                      :config="{ size: 'small' }"
                    />
                  </div>
                </div>
              </NTabPane>
            </NTabs>
            <NDivider />
            <NText depth="3">不同业务场景下的拖拽应用示例</NText>
          </NCard>
        </NSpace>
      </NGridItem>

      <!-- 右侧代码展示 -->
      <NGridItem>
        <NCard
          title="使用代码"
          size="small"
        >
          <NTabs
            v-model:value="activeTab"
            type="line"
            size="small"
          >
            <NTabPane
              name="basic"
              tab="基础用法"
            >
              <C_Code
                :code="basicCode"
                language="html"
              />
            </NTabPane>

            <NTabPane
              name="style"
              tab="样式配置"
            >
              <C_Code
                :code="styleCode"
                language="html"
              />
            </NTabPane>

            <NTabPane
              name="advanced"
              tab="高级配置"
            >
              <C_Code
                :code="advancedCode"
                language="html"
              />
            </NTabPane>

            <NTabPane
              name="scenarios"
              tab="应用场景"
            >
              <C_Code
                :code="scenarioCode"
                language="html"
              />
            </NTabPane>
          </NTabs>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import {
    getBasicCode,
    getStyleCode,
    getAdvancedCode,
    getScenarioCode,
    cardList,
    sortableList,
    canvasShapes,
    axisOptions,
  } from './data'
  interface Position {
    x: number
    y: number
  }

  /** 画布操作按钮 */
  const canvasActions = computed(() => [
    { label: '圆形', icon: 'mdi:circle', onClick: () => addShape('circle') },
    { label: '方形', icon: 'mdi:square', onClick: () => addShape('square') },
    { label: '清空', onClick: clearCanvas },
  ])

  // 响应式数据
  const activeTab = ref('basic')
  const scenarioTab = ref('cards')
  const dragEnabled = ref(true)
  const dragAxis = ref('both')
  const gridSize = ref(10)
  const dragStatus = ref('待拖拽')
  const dragCount = ref(0)
  const lastPosition = ref<Position | null>(null)

  // 回调函数
  const handleDragStart = (el: HTMLElement) => {
    dragStatus.value = '拖拽中'
    console.log('开始拖拽:', el)
  }

  const handleDragMove = (el: HTMLElement, position: Position) => {
    lastPosition.value = position
  }

  const handleDragEnd = (el: HTMLElement, position: Position) => {
    dragStatus.value = '拖拽完成'
    dragCount.value++
    lastPosition.value = position
    console.log('拖拽结束:', position)
  }

  // 场景相关方法
  const updateCardPosition = (cardId: number, position: Position) => {
    console.log(`卡片 ${cardId} 移动到:`, position)
  }

  const updateShapePosition = (shapeId: number, position: Position) => {
    const shape = canvasShapes.find(s => s.id === shapeId)
    if (shape) {
      shape.x = position.x
      shape.y = position.y
    }
  }

  const addShape = (type: 'circle' | 'square') => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    const newShape = {
      id: Date.now(),
      type,
      label: type === 'circle' ? '圆' : '方',
      x: Math.random() * 200 + 50,
      y: Math.random() * 150 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
    canvasShapes.push(newShape)
  }

  const clearCanvas = () => {
    canvasShapes.splice(0)
  }

  // 代码示例
  const basicCode = getBasicCode()
  const styleCode = getStyleCode()
  const advancedCode = getAdvancedCode()
  const scenarioCode = getScenarioCode()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
