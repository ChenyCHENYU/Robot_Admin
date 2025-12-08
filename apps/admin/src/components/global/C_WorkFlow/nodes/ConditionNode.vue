<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:36:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 18:11:32
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\nodes\ConditionNode.vue
 * @Description: 条件节点组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="condition-node">
    <div
      class="status-indicator"
      :class="data.status"
    ></div>

    <!-- 删除按钮 -->
    <div
      class="delete-btn"
      @click="handleDelete"
      title="删除节点"
    >
      <div class="i-mdi:close w-3 h-3"></div>
    </div>

    <div class="node-card">
      <div class="node-header">
        <div class="node-icon">🔀</div>
        <span class="node-title">{{ data.title }}</span>
        <div
          class="node-badge"
          v-if="conditionCount > 0"
          >{{ conditionCount }}</div
        >
      </div>

      <div class="node-content">
        <div
          v-if="conditionCount > 0"
          class="conditions-list"
        >
          <div
            v-for="condition in displayConditions"
            :key="condition.id"
            class="condition-tag"
          >
            <span class="condition-icon">→</span>
            <span>{{
              condition.name ||
              '条件' + (displayConditions.indexOf(condition) + 1)
            }}</span>
          </div>
          <div
            v-if="moreCount > 0"
            class="more-count"
            >+{{ moreCount }}</div
          >
        </div>
        <div
          v-else
          class="placeholder"
          >请设置分支条件</div
        >
      </div>
    </div>

    <div
      class="add-node-btn"
      @click="showAddMenu"
      title="添加下一个节点"
    >
      <i class="i-mdi:plus text-16px font-bold"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'

  // 定义条件类型
  interface Condition {
    id: string
    name: string
    operator:
      | 'equals'
      | 'not_equals'
      | 'greater_than'
      | 'less_than'
      | 'contains'
    value: string
  }

  interface Props {
    id: string
    data: {
      title: string
      conditions?: Condition[]
      status?: string
    }
  }

  const props = defineProps<Props>()

  const showAddMenuFn = inject('showAddMenu') as
    | ((position: { x: number; y: number }, nodeId?: string) => void)
    | undefined

  const deleteNodeFn = inject('deleteNode') as
    | ((nodeId: string) => void)
    | undefined

  // 使用安全的访问方式和默认值
  const conditions = computed(() => props.data.conditions ?? [])
  const conditionCount = computed(() => conditions.value.length)
  const displayConditions = computed(() => conditions.value.slice(0, 2))
  const moreCount = computed(() => Math.max(0, conditionCount.value - 2))

  const showAddMenu = (event: MouseEvent) => {
    event.stopPropagation() // 阻止事件冒泡到节点点击
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

    if (showAddMenuFn) {
      showAddMenuFn(
        {
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10,
        },
        props.id
      )
    }
  }

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation() // 阻止事件冒泡到节点点击
    if (deleteNodeFn) {
      deleteNodeFn(props.id)
    }
  }
</script>

<style scoped lang="scss">
  .condition-node {
    position: relative;
  }

  .status-indicator {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    z-index: 2;
    background: #faad14;

    &.completed {
      background: #52c41a;
    }
    &.active {
      background: #fa8c16;
    }
  }

  .delete-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ff4d4f;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);

    &:hover {
      transform: scale(1);
      background: #ff7875;
      box-shadow: 0 4px 12px rgba(255, 77, 79, 0.5);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .condition-node:hover .delete-btn {
    opacity: 1;
    transform: scale(1);
  }

  .node-card {
    background: white;
    border-radius: 12px;
    min-width: 220px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-color: #fa8c16;
    }
  }

  .node-header {
    padding: 12px 16px;
    background: #fff7e6;
    border-bottom: 1px solid #ffe7ba;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fa8c16;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .node-title {
    font-weight: 600;
    color: #262626;
    font-size: 14px;
    flex: 1;
  }

  .node-badge {
    background: #fa8c16;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }

  .node-content {
    padding: 16px;
  }

  .conditions-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .condition-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff7e6;
    color: #fa8c16;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 12px;
    border: 1px solid #ffd591;
    transition: all 0.2s ease;

    &:hover {
      background: #ffe7ba;
      transform: translateX(2px);
    }
  }

  .condition-icon {
    font-weight: bold;
    color: #d48806;
  }

  .more-count {
    background: #f0f0f0;
    color: #8c8c8c;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    margin-top: 4px;
  }

  .placeholder {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8c8c8c;
    font-size: 12px;
    padding: 8px 0;
  }

  .add-node-btn {
    position: absolute;
    left: 50%;
    bottom: -20px;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fa8c16, #d48806);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
    font-weight: bold;
    z-index: 10;

    &:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(250, 140, 22, 0.4);
    }
  }
</style>
