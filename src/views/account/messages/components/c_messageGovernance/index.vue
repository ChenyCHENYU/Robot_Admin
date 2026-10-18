<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息草稿、模板、定时发送、投递与审计闭环
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section class="message-governance">
    <NAlert
      v-if="store.mode === 'demo'"
      type="info"
      :bordered="false"
      >本地演示支持完整状态流转。部门、公司仅模拟受众范围，所有站内收件均只出现在当前演示账户；邮件、短信、企业微信显示“模拟送达”，不向真实用户发送。</NAlert
    >
    <NResult
      v-if="!store.capabilities.manage"
      status="403"
      title="当前账户无消息管理权限"
      description="请联系管理员开通管理能力。收件箱仍可正常使用。"
    />
    <NSpin
      v-else
      :show="store.governanceLoading"
    >
      <NCard
        v-if="section === 'templates'"
        title="消息模板"
        :bordered="false"
      >
        <template #header-extra
          ><NButton
            type="primary"
            :disabled="busy"
            @click="openTemplate()"
            >新建模板</NButton
          ></template
        >
        <C_Table
          :data="store.templates"
          :columns="templateColumns"
          row-key="id"
          :config="{
            toolbar: { show: false },
            pagination: { pageSize: 10 },
            display: { scrollX: 760 },
          }"
        />
      </NCard>
      <template v-else>
        <NCard
          title="发送与记录"
          :bordered="false"
        >
          <template #header-extra
            ><NButton
              type="primary"
              :disabled="busy"
              @click="openDispatch()"
              >撰写消息</NButton
            ></template
          >
          <C_Table
            :data="store.dispatches"
            :columns="dispatchColumns"
            row-key="id"
            :config="{
              toolbar: { show: false },
              pagination: { pageSize: 10 },
              display: { scrollX: 1020 },
            }"
          />
        </NCard>
        <NCard
          title="操作审计"
          :bordered="false"
        >
          <template #header-extra
            ><NButton
              size="small"
              :loading="auditLoading"
              @click="refreshAudit"
              >刷新审计</NButton
            ></template
          >
          <C_Table
            :data="store.audit"
            :columns="auditColumns"
            row-key="id"
            :config="{
              toolbar: { show: false },
              pagination: { pageSize: 8 },
              display: { scrollX: 1000 },
            }"
          />
        </NCard>
      </template>
    </NSpin>

    <NModal
      v-model:show="showEditor"
      preset="card"
      :title="
        editorKind === 'template'
          ? editId
            ? '编辑模板'
            : '新建模板'
          : editId
            ? '编辑消息草稿'
            : '撰写消息'
      "
      class="message-editor-modal"
      :mask-closable="!busy"
      :closable="!busy"
    >
      <NAlert
        v-if="editorKind === 'dispatch'"
        type="info"
        :show-icon="false"
        class="editor-note"
      >
        先保存草稿，再在发送记录中明确发送。定时消息只有确认发送后才进入计划。
        <span v-if="store.mode === 'demo'"
          >演示定时仅在页面运行期间推进，关闭浏览器后不会真实投递。</span
        >
      </NAlert>
      <div
        v-if="editorKind === 'dispatch'"
        class="template-picker"
      >
        <NSelect
          v-model:value="selectedTemplate"
          clearable
          placeholder="选择已启用模板（可选）"
          :options="templateOptions"
          :disabled="busy"
        />
        <NButton
          :disabled="!selectedTemplate || busy"
          @click="applyTemplate"
          >使用模板</NButton
        >
      </div>
      <C_Form
        ref="formRef"
        v-model="editor"
        :options="editorOptions"
        :config="editorConfig"
      />
      <template v-if="editorKind === 'dispatch'">
        <NFormItem label="受众范围"
          ><NSelect
            v-model:value="audience"
            :disabled="busy"
            :options="audienceOptions"
        /></NFormItem>
        <NFormItem label="定时发送"
          ><NDatePicker
            v-model:value="scheduledAt"
            type="datetime"
            clearable
            :disabled="busy"
            :is-date-disabled="isPastDay"
        /></NFormItem>
      </template>
      <template #footer
        ><NSpace justify="end"
          ><NButton
            :disabled="busy"
            @click="showPreview = true"
            >预览</NButton
          ><NButton
            :disabled="busy"
            @click="showEditor = false"
            >取消</NButton
          ><NButton
            type="primary"
            :loading="busy"
            @click="formRef?.submit()"
            >{{ editorKind === 'template' ? '保存模板' : '保存草稿' }}</NButton
          ></NSpace
        ></template
      >
    </NModal>
    <NModal
      v-model:show="showPreview"
      preset="card"
      title="消息预览"
      class="message-preview-modal"
    >
      <NText depth="3"
        >{{ getOptionLabel(CATEGORY_OPTIONS, editor.category) }} ·
        {{ getOptionLabel(PRIORITY_OPTIONS, editor.priority) }}</NText
      >
      <h2>{{ editor.title || '未填写标题' }}</h2
      ><p class="preview-body">{{ editor.content || '未填写正文' }}</p>
      <NText depth="3"
        >通道：{{
          editor.channels
            .map(channel => getOptionLabel(CHANNEL_OPTIONS, channel))
            .join('、') || '未选择'
        }}</NText
      >
    </NModal>
    <NModal
      :show="!!deliveryDispatchId"
      preset="card"
      title="投递记录"
      class="message-preview-modal"
      @update:show="!$event && (deliveryDispatchId = null)"
    >
      <NEmpty
        v-if="!currentDeliveries.length"
        description="草稿尚未投递；确认发送后会生成记录"
      />
      <NList v-else>
        <NListItem
          v-for="delivery in currentDeliveries"
          :key="delivery.id"
        >
          <div
            ><strong>{{
              getOptionLabel(CHANNEL_OPTIONS, delivery.channel)
            }}</strong>
            · {{ deliveryLabel(delivery.status) }}</div
          >
          <NText depth="3"
            >尝试 {{ delivery.attempts }} 次 ·
            {{ formatMessageTime(delivery.updatedAt) }}</NText
          >
          <p
            v-if="delivery.error"
            class="delivery-error"
            >{{ delivery.error }}</p
          >
          <template #suffix
            ><NButton
              v-if="['failed', 'pending'].includes(delivery.status)"
              size="small"
              :loading="busy"
              @click="retry(delivery.id)"
              >重试投递</NButton
            ></template
          >
        </NListItem>
      </NList>
    </NModal>
  </section>
</template>

<script setup lang="ts">
  import { useMessageGovernance } from './useMessageGovernance'

  defineOptions({ name: 'AccountMessageGovernance' })
  defineProps<{ section: 'sending' | 'templates' }>()
  const {
    store,
    busy,
    auditLoading,
    showEditor,
    showPreview,
    editorKind,
    editId,
    editor,
    formRef,
    selectedTemplate,
    scheduledAt,
    audience,
    deliveryDispatchId,
    audienceOptions,
    templateOptions,
    currentDeliveries,
    editorOptions,
    editorConfig,
    openTemplate,
    openDispatch,
    applyTemplate,
    isPastDay,
    retry,
    refreshAudit,
    deliveryLabel,
    templateColumns,
    dispatchColumns,
    auditColumns,
    CATEGORY_OPTIONS,
    PRIORITY_OPTIONS,
    CHANNEL_OPTIONS,
    formatMessageTime,
    getOptionLabel,
  } = useMessageGovernance()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
