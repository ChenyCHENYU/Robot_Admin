<!--
  ERTableEditor — ER 表编辑器抽屉
  负责：表名/注释编辑 + 字段 CRUD + 主键处理
-->
<template>
  <NDrawer
    :show="show"
    width="600"
    placement="right"
    @update:show="$emit('update:show', $event)"
  >
    <NDrawerContent
      :title="`编辑表: ${editingTable?.name || '新表'}`"
      closable
    >
      <div
        class="table-editor"
        v-if="editingTable"
      >
        <NForm
          :model="editingTable"
          label-placement="top"
        >
          <NFormItem label="表名">
            <NInput
              v-model:value="editingTable.name"
              placeholder="请输入表名"
            />
          </NFormItem>
          <NFormItem label="表注释">
            <NInput
              v-model:value="editingTable.comment"
              placeholder="表注释"
            />
          </NFormItem>

          <NDivider>字段列表</NDivider>

          <div class="fields-container">
            <NCard
              v-for="(field, index) in editingTable.fields"
              :key="index"
              size="small"
              class="field-card"
            >
              <template #header>
                <div class="field-header">
                  <span>#{{ index + 1 }} {{ field.name || '新字段' }}</span>
                  <NButton
                    @click="removeField(index)"
                    size="tiny"
                    type="error"
                    quaternary
                    :disabled="editingTable.fields.length <= 1"
                  >
                    删除
                  </NButton>
                </div>
              </template>

              <NGrid
                :cols="2"
                :x-gap="12"
              >
                <NGi>
                  <NFormItem
                    label="字段名"
                    size="small"
                  >
                    <NInput
                      v-model:value="field.name"
                      placeholder="字段名"
                      size="small"
                    />
                  </NFormItem>
                </NGi>
                <NGi>
                  <NFormItem
                    label="类型"
                    size="small"
                  >
                    <NSelect
                      v-model:value="field.type"
                      :options="fieldTypes"
                      size="small"
                      filterable
                      placeholder="选择类型"
                    />
                  </NFormItem>
                </NGi>
              </NGrid>

              <NSpace style="margin-top: 12px">
                <NCheckbox
                  v-model:checked="field.isPrimaryKey"
                  @update:checked="handlePrimaryKey(field, $event)"
                >
                  主键
                </NCheckbox>
                <NCheckbox v-model:checked="field.isRequired">必填</NCheckbox>
                <NCheckbox v-model:checked="field.isForeignKey">外键</NCheckbox>
              </NSpace>

              <NFormItem
                label="注释"
                size="small"
                style="margin-top: 12px"
              >
                <NInput
                  v-model:value="field.comment"
                  placeholder="字段注释"
                  size="small"
                />
              </NFormItem>
            </NCard>

            <NButton
              @click="addField"
              dashed
              block
              type="primary"
              ghost
              style="margin-top: 16px"
            >
              <template #icon><div class="i-mdi:plus"></div></template>
              添加字段
            </NButton>
          </div>
        </NForm>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="$emit('update:show', false)">取消</NButton>
          <NButton
            @click="$emit('save')"
            type="primary"
            >保存</NButton
          >
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
  import type { ERTable, ERField } from '@/types/antv'
  import { fieldTypes } from '../data'

  defineProps<{
    show: boolean
  }>()

  const editingTable = defineModel<ERTable>('editingTable')

  const emit = defineEmits<{
    'update:show': [value: boolean]
    save: []
    'add-field': []
    'remove-field': [index: number]
    'handle-primary-key': [field: ERField, isPrimaryKey: boolean]
  }>()

  const handlePrimaryKey = (field: ERField, isPrimaryKey: boolean) =>
    emit('handle-primary-key', field, isPrimaryKey)

  const addField = () => emit('add-field')

  const removeField = (index: number) => emit('remove-field', index)
</script>
