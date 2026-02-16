<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-03 09:14:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 13:48:45
 * @FilePath: \Robot_Admin\src\components\global\C_WorkFlow\nodes\ApprovalNode.vue
 * @Description: 审批节点组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="approval-node">
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
        <div class="node-icon">
          <i class="i-mdi:account text-white text-12px"></i>
        </div>
        <span class="node-title">{{ data.title }}</span>
        <div
          class="node-badge"
          v-if="approverCount > 0"
          >{{ approverCount }}</div
        >
        <div
          class="approval-mode-badge"
          v-if="data.approvalMode"
        >
          {{ getApprovalModeText(data.approvalMode) }}
        </div>
      </div>

      <div class="node-content">
        <div
          v-if="approverCount > 0"
          class="approvers-list"
        >
          <div
            v-for="approver in displayApprovers"
            :key="approver.id"
            class="approver-tag"
          >
            <div class="approver-info">
              <div class="approver-avatar">
                <NAvatar
                  :src="approver.avatar"
                  :fallback-src="getDefaultAvatar(approver.name)"
                  size="small"
                />
              </div>
              <div class="approver-details">
                <span class="approver-name">{{ approver.name }}</span>
                <span class="approver-dept">{{ approver.department }}</span>
                <span class="approver-role">{{ approver.role }}</span>
              </div>
            </div>
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
        >
          <i class="i-mdi:account-plus text-24px text-gray-400"></i>
          <span>请设置审批人</span>
        </div>
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

  // 定义审批人类型
  interface Approver {
    id: string
    name: string
    avatar?: string
    department: string
    role: string
    email?: string
    phone?: string
  }

  interface Props {
    id: string
    data: {
      title: string
      approvers?: Approver[]
      approvalMode?: 'any' | 'all' | 'sequence'
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
  const approvers = computed(() => props.data.approvers ?? [])
  const approverCount = computed(() => approvers.value.length)
  const displayApprovers = computed(() => approvers.value.slice(0, 3))
  const moreCount = computed(() => Math.max(0, approverCount.value - 3))

  const getApprovalModeText = (mode?: string) => {
    const modeMap = {
      any: '或签',
      all: '会签',
      sequence: '顺序',
    }
    return modeMap[mode as keyof typeof modeMap] || ''
  }

  const getDefaultAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  }

  const handleNodeClick = () => {
    // 不阻止事件冒泡，让 VueFlow 的 node-click 事件自然触发
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
  .approval-node {
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

    &.approved {
      background: #52c41a;
    }
    &.rejected {
      background: #ff4d4f;
    }
    &.pending {
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
    z-index: 100; /* 确保在所有元素之上 */
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

  .approval-node:hover .delete-btn {
    opacity: 1;
    transform: scale(1);
  }

  .node-card {
    background: white;
    border-radius: 12px;
    min-width: 240px;
    max-width: 300px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-color: #1890ff;
    }
  }

  .node-header {
    padding: 12px 16px;
    background: linear-gradient(135deg, #e6f7ff, #f0f9ff);
    border-bottom: 1px solid #91d5ff;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #1890ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node-title {
    font-weight: 600;
    color: var(--n-text-color-1);
    font-size: 14px;
    flex: 1;
  }

  .node-badge {
    background: #1890ff;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }

  .approval-mode-badge {
    background: #f0f0f0;
    color: #666;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 500;
  }

  .node-content {
    padding: 16px;
  }

  .approvers-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .approver-tag {
    background: linear-gradient(135deg, #e6f7ff, #f0f9ff);
    border: 1px solid #91d5ff;
    border-radius: 8px;
    padding: 8px 12px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateX(2px);
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    }

    .approver-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .approver-avatar {
        flex-shrink: 0;
      }

      .approver-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;

        .approver-name {
          font-weight: 600;
          color: #1890ff;
          font-size: 13px;
        }

        .approver-dept {
          font-size: 11px;
          color: #666;
          background: rgba(0, 0, 0, 0.05);
          padding: 1px 4px;
          border-radius: 4px;
          display: inline-block;
        }

        .approver-role {
          font-size: 10px;
          color: #999;
        }
      }
    }
  }

  .more-count {
    background: #f0f0f0;
    color: #8c8c8c;
    padding: 6px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    border: 1px dashed #d9d9d9;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #8c8c8c;
    font-size: 12px;
    padding: 20px 0;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    background: #fafafa;

    span {
      font-weight: 500;
    }
  }

  .add-node-btn {
    position: absolute;
    left: 50%;
    bottom: -20px;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1890ff, #722ed1);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;

    &:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
    }
  }
</style>
