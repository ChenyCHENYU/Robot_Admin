<template>
  <NDrawer
    :show="show"
    width="450"
    title="编辑类"
    @update:show="emit('update:show', $event)"
  >
    <div
      v-if="editingClass"
      class="class-editor"
    >
      <NForm label-placement="top">
        <NFormItem label="类名">
          <NInput
            v-model:value="editingClass.name"
            placeholder="请输入类名"
          />
        </NFormItem>

        <NDivider style="margin: 20px 0">属性</NDivider>
        <div class="section">
          <div
            v-for="(attr, index) in editingClass.attributes"
            :key="index"
            class="item"
          >
            <NCard
              size="small"
              style="margin-bottom: 12px"
            >
              <template #header>
                <div class="section-header">
                  <span style="font-size: 13px"
                    >#{{ index + 1 }} {{ attr.name || '新属性' }}</span
                  >
                  <NButton
                    @click="editingClass!.attributes.splice(index, 1)"
                    size="tiny"
                    type="error"
                    quaternary
                    style="margin-left: auto"
                  >
                    删除
                  </NButton>
                </div>
              </template>
              <NSpace
                vertical
                size="small"
              >
                <NSpace>
                  <NFormItem
                    label="属性名"
                    style="margin: 0; flex: 1"
                  >
                    <NInput
                      v-model:value="attr.name"
                      placeholder="属性名"
                      size="small"
                    />
                  </NFormItem>
                  <NFormItem
                    label="类型"
                    style="margin: 0; flex: 1"
                  >
                    <NInput
                      v-model:value="attr.type"
                      placeholder="类型"
                      size="small"
                    />
                  </NFormItem>
                </NSpace>
                <NFormItem
                  label="可见性"
                  style="margin: 0"
                >
                  <NRadioGroup
                    v-model:value="attr.visibility"
                    size="small"
                  >
                    <NRadio value="public">+ public</NRadio>
                    <NRadio value="private">- private</NRadio>
                    <NRadio value="protected"># protected</NRadio>
                  </NRadioGroup>
                </NFormItem>
              </NSpace>
            </NCard>
          </div>
          <NButton
            @click="
              editingClass!.attributes.push({
                name: 'newAttribute',
                type: 'string',
                visibility: 'private',
              })
            "
            dashed
            block
            type="primary"
            ghost
            size="small"
          >
            <template #icon><div class="i-mdi-plus"></div></template>
            添加属性
          </NButton>
        </div>

        <NDivider style="margin: 20px 0">方法</NDivider>
        <div class="section">
          <div
            v-for="(method, index) in editingClass.methods"
            :key="index"
            class="item"
          >
            <NCard
              size="small"
              style="margin-bottom: 12px"
            >
              <template #header>
                <div class="section-header">
                  <span style="font-size: 13px"
                    >#{{ index + 1 }} {{ method.name || '新方法' }}</span
                  >
                  <NButton
                    @click="editingClass!.methods.splice(index, 1)"
                    size="tiny"
                    type="error"
                    quaternary
                    style="margin-left: auto"
                  >
                    删除
                  </NButton>
                </div>
              </template>
              <NSpace
                vertical
                size="small"
              >
                <NSpace>
                  <NFormItem
                    label="方法名"
                    style="margin: 0; flex: 1"
                  >
                    <NInput
                      v-model:value="method.name"
                      placeholder="方法名"
                      size="small"
                    />
                  </NFormItem>
                  <NFormItem
                    label="返回类型"
                    style="margin: 0; flex: 1"
                  >
                    <NInput
                      v-model:value="method.returnType"
                      placeholder="返回类型"
                      size="small"
                    />
                  </NFormItem>
                </NSpace>
                <NFormItem
                  label="可见性"
                  style="margin: 0"
                >
                  <NRadioGroup
                    v-model:value="method.visibility"
                    size="small"
                  >
                    <NRadio value="public">+ public</NRadio>
                    <NRadio value="private">- private</NRadio>
                    <NRadio value="protected"># protected</NRadio>
                  </NRadioGroup>
                </NFormItem>
              </NSpace>
            </NCard>
          </div>
          <NButton
            @click="
              editingClass!.methods.push({
                name: 'newMethod',
                returnType: 'void',
                visibility: 'public',
              })
            "
            dashed
            block
            type="primary"
            ghost
            size="small"
          >
            <template #icon><div class="i-mdi-plus"></div></template>
            添加方法
          </NButton>
        </div>

        <NDivider style="margin: 20px 0"></NDivider>
        <NSpace justify="space-between">
          <NButton
            @click="emit('delete')"
            type="error"
            ghost
          >
            <template #icon><div class="i-mdi-delete"></div></template>
            删除类
          </NButton>
          <NSpace>
            <NButton @click="emit('update:show', false)">取消</NButton>
            <NButton
              @click="emit('save')"
              type="primary"
            >
              保存
            </NButton>
          </NSpace>
        </NSpace>
      </NForm>
    </div>
  </NDrawer>
</template>

<script setup lang="ts">
  import type { UMLClass } from '@/types/antv'

  defineProps<{
    show: boolean
  }>()

  const editingClass = defineModel<UMLClass>('editingClass')

  const emit = defineEmits<{
    'update:show': [value: boolean]
    save: []
    delete: []
  }>()
</script>

<style lang="scss" scoped>
  .class-editor {
    padding: 20px;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .section {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d4d4d4;
      border-radius: 3px;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item {
    margin-bottom: 8px;
  }

  .section .n-card {
    border: 1px solid #e8e8e8;
  }

  .section .n-card-header {
    padding: 8px 12px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
  }

  .section .n-card__content {
    padding: 12px;
  }

  .section .n-form-item {
    margin-bottom: 0;
  }

  .section .n-form-item-label {
    font-size: 12px;
    margin-bottom: 4px;
    color: #666;
  }
</style>
