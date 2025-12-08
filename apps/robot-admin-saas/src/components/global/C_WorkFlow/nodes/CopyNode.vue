<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:35:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 13:49:43
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\nodes\CopyNode.vue
 * @Description: 复制节点组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="copy-node">
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

    <div
      class="node-card"
      @click="handleNodeClick"
    >
      <div class="node-header">
        <div class="node-icon">📋</div>
        <span class="node-title">{{ data.title }}</span>
        <div
          class="node-badge"
          v-if="copyCount > 0"
          >{{ copyCount }}</div
        >
      </div>

      <div class="node-content">
        <div
          v-if="copyCount > 0"
          class="copy-users-list"
        >
          <div
            v-for="user in displayCopyUsers"
            :key="user.id"
            class="copy-user-tag"
          >
            {{ user.name }}
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
          >请设置抄送人</div
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
  interface User {
    id: string
    name: string
    department: string
    role: string
  }

  interface Props {
    id: string
    data: {
      title: string
      copyUsers?: User[]
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

  // 统一使用安全的访问方式
  const copyUsers = computed(() => props.data.copyUsers ?? [])
  const copyCount = computed(() => copyUsers.value.length)
  const displayCopyUsers = computed(() => copyUsers.value.slice(0, 3))
  const moreCount = computed(() => Math.max(0, copyCount.value - 3))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNodeClick = (event: MouseEvent) => {
    // 不阻止事件冒泡，让VueFlow的node-click事件自然触发
    console.log('Copy node clicked:', props.id)
  }

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
  .copy-node {
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
      background: #1890ff;
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

  .copy-node:hover .delete-btn {
    opacity: 1;
    transform: scale(1);
  }

  .node-card {
    background: white;
    border-radius: 12px;
    min-width: 200px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-color: #52c41a;
    }
  }

  .node-header {
    padding: 12px 16px;
    background: #f6ffed;
    border-bottom: 1px solid #d9f7be;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #52c41a;
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
    background: #52c41a;
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

  .copy-users-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .copy-user-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f6ffed;
    color: #52c41a;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    border: 1px solid #b7eb8f;
  }

  .more-count {
    background: #f0f0f0;
    color: #8c8c8c;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
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
    background: linear-gradient(135deg, #52c41a, #389e0d);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
    font-weight: bold;
    z-index: 10;

    &:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
    }
  }
</style>
