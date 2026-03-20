<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 08:53:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 15:32:41
 * @FilePath: \Robot_Admin\src\views\demo\20-dragable\index.vue
 * @Description: 拖拽
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="draggable-demo">
    <c_vTitle
      title="拖拽组件场景示例"
      icon="mdi:drag"
      description="支持看板式拖拽、列表排序、分组拖拽等特性，适用于任务管理、内容排序等场景"
    />

    <!-- 看板式拖拽 -->
    <NCard
      title="看板式任务管理"
      class="kanban-card"
    >
      <template #header-extra>
        <NButton
          @click="addNewTask"
          type="primary"
          size="small"
        >
          <template #icon><div class="i-mdi:plus"></div></template>
          添加任务
        </NButton>
      </template>

      <div class="kanban-board">
        <div
          v-for="column in kanbanColumnsConfig"
          :key="column.key"
          class="kanban-column"
        >
          <div
            class="column-header"
            :class="column.headerClass"
          >
            <h4>{{ column.title }} ({{ kanbanTasks[column.key].length }})</h4>
          </div>
          <C_Draggable
            v-model="kanbanTasks[column.key]"
            group="kanban"
            :animation="150"
            class="task-list"
          >
            <template #default="{ item }">
              <div class="task-card">
                <div class="task-header">
                  <NTag
                    :type="getPriorityType(item.priority)"
                    size="small"
                  >
                    {{ getPriorityText(item.priority) }}
                  </NTag>
                  <span class="task-date">{{ item.date }}</span>
                </div>
                <h5 class="task-title">{{ item.title }}</h5>
                <div class="task-meta">
                  <div class="meta-item">
                    <div class="i-mdi:folder-outline"></div>
                    <span>{{ item.tag }}</span>
                  </div>
                  <div class="meta-item">
                    <div class="i-mdi:message-outline"></div>
                    <span>{{ item.comments }} 评论</span>
                  </div>
                </div>
                <div class="task-bottom">
                  <div class="assignee">
                    <NAvatar
                      :size="24"
                      :src="item.avatar"
                    />
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="handle">
                    <div class="i-mdi:drag-vertical"></div>
                  </div>
                </div>
              </div>
            </template>
            <template #empty>
              <div class="empty-state">
                <div :class="column.emptyIcon"></div>
                <p>{{ column.emptyText }}</p>
              </div>
            </template>
          </C_Draggable>
        </div>
      </div>
    </NCard>

    <!-- 双栏布局 -->
    <NGrid
      :cols="4"
      :x-gap="16"
      class="bottom-section"
    >
      <!-- 技术栈展示 -->
      <NGridItem :span="3">
        <NCard
          title="技术栈展示"
          size="small"
        >
          <template #header-extra>
            <NText depth="3">拖拽排序</NText>
          </template>
          <C_Draggable
            v-model="techCards"
            :animation="150"
            handle=".tech-handle"
            class="tech-list"
          >
            <template #default="{ item }">
              <div class="tech-card">
                <div class="tech-header">
                  <div class="tech-info">
                    <img
                      :src="item.logo"
                      class="tech-logo"
                    />
                    <span
                      class="tech-name"
                      @click="openLink(item.link)"
                      >{{ item.name }}</span
                    >
                  </div>
                  <NTooltip>
                    <template #trigger>
                      <div class="tech-handle">
                        <div class="i-mdi:drag-vertical"></div>
                      </div>
                    </template>
                    拖拽排序
                  </NTooltip>
                </div>
                <div class="tech-desc">
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </template>
          </C_Draggable>
        </NCard>
      </NGridItem>

      <!-- 活动列表 -->
      <NGridItem :span="1">
        <NCard
          title="活动列表"
          size="small"
        >
          <template #header-extra>
            <NButton
              @click="addActivity"
              size="small"
              quaternary
            >
              <template #icon><div class="i-mdi:plus"></div></template>
            </NButton>
          </template>
          <C_Draggable
            v-model="activities"
            :animation="150"
            class="activity-list"
          >
            <template #default="{ item, index }">
              <div
                class="activity-item"
                :style="{ backgroundColor: getActivityColor(index) }"
              >
                <div class="activity-dot"></div>
                <span class="activity-text">{{ item.task }}</span>
              </div>
            </template>
          </C_Draggable>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
  import {
    type Priority,
    priorityConfig,
    rainbowColors,
    kanbanData,
    kanbanColumnsConfig,
    techCardsData,
    activitiesData,
    taskNamesList,
  } from './data'

  const message = useMessage()

  // 统一的响应式数据管理
  const kanbanTasks = ref(kanbanData)
  const techCards = ref(techCardsData)
  const activities = ref(activitiesData)

  // 工具函数
  const getPriorityType = (priority: Priority) => priorityConfig[priority].type
  const getPriorityText = (priority: Priority) => priorityConfig[priority].text
  const getActivityColor = (index: number) =>
    rainbowColors[index % rainbowColors.length]
  const openLink = (url: string) => window.open(url, '_blank')

  // 操作方法
  const addNewTask = () => {
    const newTask = {
      id: Date.now(),
      title: `新任务 ${kanbanTasks.value.todo.length + 1}`,
      priority: 'medium' as Priority,
      date: new Date().toLocaleDateString(),
      tag: 'web',
      comments: 0,
      avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/demo1.JPG',
      name: 'New User',
    }
    kanbanTasks.value.todo.push(newTask)
    message.success('新任务已添加')
  }

  const addActivity = () => {
    const randomTask =
      taskNamesList[Math.floor(Math.random() * taskNamesList.length)]
    const newActivity = {
      id: String(Date.now()),
      task: randomTask,
    }

    activities.value.push(newActivity)
    message.success('新活动已添加')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
