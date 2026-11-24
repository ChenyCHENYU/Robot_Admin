<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息草稿、模板、定时发送、投递与审计闭环
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <section class="message-governance">
    <NAlert
      v-if="page.store.mode === 'demo'"
      type="info"
      :bordered="false"
      >本地演示支持完整状态流转。部门、公司仅模拟受众范围，所有站内收件均只出现在当前演示账户；邮件、短信、企业微信显示“模拟送达”，不向真实用户发送。</NAlert
    >
    <NResult
      v-if="!page.store.capabilities.manage"
      status="403"
      title="当前账户无消息管理权限"
      description="请联系管理员开通管理能力。收件箱仍可正常使用。"
    />
    <NSpin
      v-else
      :show="page.store.governanceLoading"
    >
      <NCard
        v-if="section === 'templates'"
        title="消息模板"
        :bordered="false"
      >
        <template #header-extra
          ><NButton
            type="primary"
            :disabled="page.busy"
            @click="page.openTemplate()"
            >新建模板</NButton
          ></template
        >
        <C_Table
          :data="page.store.templates"
          :columns="page.templateColumns"
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
              :disabled="page.busy"
              @click="page.openDispatch()"
              >撰写消息</NButton
            ></template
          >
          <C_Table
            :data="page.store.dispatches"
            :columns="page.dispatchColumns"
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
              :loading="page.auditLoading"
              @click="page.refreshAudit"
              >刷新审计</NButton
            ></template
          >
          <C_Table
            :data="page.store.audit"
            :columns="page.auditColumns"
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
      v-model:show="page.showEditor"
      preset="card"
      :title="
        page.editorKind === 'template'
          ? page.editId
            ? '编辑模板'
            : '新建模板'
          : page.editId
            ? '编辑消息草稿'
            : '撰写消息'
      "
      class="message-editor-modal"
      :mask-closable="!page.busy"
      :closable="!page.busy"
    >
      <NAlert
        v-if="page.editorKind === 'dispatch'"
        type="info"
        :show-icon="false"
        class="editor-note"
      >
        先保存草稿，再在发送记录中明确发送。定时消息只有确认发送后才进入计划。
        <span v-if="page.store.mode === 'demo'"
          >演示定时仅在页面运行期间推进，关闭浏览器后不会真实投递。</span
        >
      </NAlert>
      <div
        v-if="page.editorKind === 'dispatch'"
        class="template-picker"
      >
        <NSelect
          v-model:value="page.selectedTemplate"
          clearable
          placeholder="选择已启用模板（可选）"
          :options="page.templateOptions"
          :disabled="page.busy"
        />
        <NButton
          :disabled="!page.selectedTemplate || page.busy"
          @click="page.applyTemplate"
          >使用模板</NButton
        >
      </div>
      <C_Form
        ref="formRef"
        v-model="page.editor"
        :options="page.editorOptions"
        :config="page.editorConfig"
      />
      <template v-if="page.editorKind === 'dispatch'">
        <NFormItem label="受众范围"
          ><NSelect
            v-model:value="page.audience"
            :disabled="page.busy"
            :options="page.audienceOptions"
        /></NFormItem>
        <NFormItem label="定时发送"
          ><NDatePicker
            v-model:value="page.scheduledAt"
            type="datetime"
            clearable
            :disabled="page.busy"
            :is-date-disabled="page.isPastDay"
        /></NFormItem>
      </template>
      <template #footer
        ><NSpace justify="end"
          ><NButton
            :disabled="page.busy"
            @click="page.showPreview = true"
            >预览</NButton
          ><NButton
            :disabled="page.busy"
            @click="page.showEditor = false"
            >取消</NButton
          ><NButton
            type="primary"
            :loading="page.busy"
            @click="page.formRef?.submit()"
            >{{
              page.editorKind === 'template' ? '保存模板' : '保存草稿'
            }}</NButton
          ></NSpace
        ></template
      >
    </NModal>
    <NModal
      v-model:show="page.showPreview"
      preset="card"
      title="消息预览"
      class="message-preview-modal"
    >
      <NText depth="3"
        >{{ page.getOptionLabel(page.CATEGORY_OPTIONS, page.editor.category) }}
        ·
        {{
          page.getOptionLabel(page.PRIORITY_OPTIONS, page.editor.priority)
        }}</NText
      >
      <h2>{{ page.editor.title || '未填写标题' }}</h2
      ><p class="preview-body">{{ page.editor.content || '未填写正文' }}</p>
      <NText depth="3"
        >通道：{{
          page.editor.channels
            .map(channel => page.getOptionLabel(page.CHANNEL_OPTIONS, channel))
            .join('、') || '未选择'
        }}</NText
      >
    </NModal>
    <NModal
      :show="!!page.deliveryDispatchId"
      preset="card"
      title="投递记录"
      class="message-preview-modal"
      @update:show="!$event && (page.deliveryDispatchId = null)"
    >
      <NEmpty
        v-if="!page.currentDeliveries.length"
        description="草稿尚未投递；确认发送后会生成记录"
      />
      <NList v-else>
        <NListItem
          v-for="delivery in page.currentDeliveries"
          :key="delivery.id"
        >
          <div
            ><strong>{{
              page.getOptionLabel(page.CHANNEL_OPTIONS, delivery.channel)
            }}</strong>
            · {{ page.deliveryLabel(delivery.status) }}</div
          >
          <NText depth="3"
            >尝试 {{ delivery.attempts }} 次 ·
            {{ page.formatMessageTime(delivery.updatedAt) }}</NText
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
              :loading="page.busy"
              @click="page.retry(delivery.id)"
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

  defineOptions({ name: 'MessageGovernance' })
  defineProps<{ section: 'sending' | 'templates' }>()
  const controller = useMessageGovernance()
  const page = proxyRefs(controller)
  const { formRef } = controller
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
