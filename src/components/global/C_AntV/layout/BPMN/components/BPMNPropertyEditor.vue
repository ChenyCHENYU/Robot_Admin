<template>
  <NDrawer
    :show="show"
    width="300"
    title="属性设置"
    @update:show="emit('update:show', $event)"
  >
    <div
      v-if="editingElement"
      class="property-panel"
    >
      <div class="property-item">
        <div class="property-label">名称</div>
        <NInput
          v-model:value="editingElement.label"
          placeholder="请输入名称"
          size="small"
        />
      </div>
      <div class="property-item">
        <div class="property-label">类型</div>
        <NInput
          :value="typeName"
          readonly
          size="small"
        />
      </div>
      <div
        class="property-item"
        v-if="editingElement.shape === 'activity'"
      >
        <div class="property-label">描述</div>
        <NInput
          v-model:value="editingElement.description"
          type="textarea"
          :rows="3"
          placeholder="请输入活动描述"
          size="small"
        />
      </div>
      <div
        class="property-item"
        v-if="editingElement.shape === 'activity'"
      >
        <div class="property-label">执行人</div>
        <NInput
          v-model:value="editingElement.assignee"
          placeholder="请输入执行人"
          size="small"
        />
      </div>
      <div class="form-actions">
        <NSpace>
          <NButton
            @click="emit('save')"
            type="primary"
            size="small"
          >
            保存
          </NButton>
          <NButton
            @click="emit('update:show', false)"
            size="small"
          >
            取消
          </NButton>
          <NButton
            @click="emit('delete')"
            type="error"
            size="small"
          >
            删除
          </NButton>
        </NSpace>
      </div>
    </div>
  </NDrawer>
</template>

<script setup lang="ts">
  import { elementTypeNames } from '../data'

  interface BPMNElement {
    id: string
    shape: string
    label?: string
    description?: string
    assignee?: string
    [key: string]: any
  }

  defineProps<{
    show: boolean
  }>()

  const editingElement = defineModel<BPMNElement>('editingElement')

  const emit = defineEmits<{
    'update:show': [value: boolean]
    save: []
    delete: []
  }>()

  const typeName = computed(
    () =>
      elementTypeNames[
        editingElement.value?.shape as keyof typeof elementTypeNames
      ] ||
      editingElement.value?.shape ||
      ''
  )
</script>
