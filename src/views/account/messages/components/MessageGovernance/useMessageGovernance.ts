/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息中心 useMessageGovernance 交互控制器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  FormConfig,
  FormInstance,
} from '@robot-admin/naive-ui-components/C_Form'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import type {
  NotificationAudit,
  NotificationDelivery,
  NotificationDispatch,
  NotificationTemplate,
} from '@/api/notifications.contract'
import { s_notificationStore } from '@/stores/notification'
import {
  AUDIT_ACTION_LABELS,
  CATEGORY_OPTIONS,
  CHANNEL_OPTIONS,
  PRIORITY_OPTIONS,
  DELIVERY_STATUS,
  DISPATCH_STATUS,
  createMessageEditor,
  formatMessageTime,
  getEditorOptions,
  getOptionLabel,
  type MessageEditor,
} from '../../data'

/** 管理当前视图的独立加载、命令与生命周期。 */
export function useMessageGovernance() {
  const store = s_notificationStore()
  const message = useMessage()
  const dialog = useDialog()
  const busy = ref(false)
  const auditLoading = ref(false)
  const showEditor = ref(false)
  const showPreview = ref(false)
  const editorKind = ref<'template' | 'dispatch'>('dispatch')
  const editId = ref<string | undefined>()
  const editRevision = ref<number | undefined>()
  const editor = ref<MessageEditor>(createMessageEditor())
  const formRef = ref<FormInstance<MessageEditor> | null>(null)
  const selectedTemplate = ref<string | null>(null)
  const scheduledAt = ref<number | null>(null)
  const audience = ref<NotificationDispatch['audience']>('self')
  const deliveryDispatchId = ref<string | null>(null)
  const audienceOptions = [
    { label: '本人', value: 'self' },
    { label: '本部门', value: 'department' },
    { label: '本公司', value: 'company' },
  ]
  const templateOptions = computed(() =>
    store.templates
      .filter(item => item.enabled)
      .map(item => ({ label: item.name, value: item.id }))
  )
  const currentDeliveries = computed(() =>
    store.deliveries.filter(
      item => item.dispatchId === deliveryDispatchId.value
    )
  )
  const editorOptions = computed(() =>
    getEditorOptions(editorKind.value === 'template').map(option => ({
      ...option,
      disabled: busy.value,
    }))
  )

  /** 所有治理动作保留单一执行锁，并将服务端错误反馈为可重试状态。 */
  const run = async (
    operation: () => Promise<unknown>,
    text: string
  ): Promise<boolean> => {
    if (busy.value || !store.capabilities.manage) return false
    busy.value = true
    try {
      await operation()
      message.success(text)
      return true
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败，请重试')
      return false
    } finally {
      busy.value = false
    }
  }

  /** 打开模板编辑，复制嵌套通道数组以隔离未保存修改。 */
  const openTemplate = (item?: NotificationTemplate): void => {
    editorKind.value = 'template'
    editId.value = item?.id
    editRevision.value = item?.revision
    editor.value = item
      ? { ...item, channels: [...item.channels] }
      : createMessageEditor()
    selectedTemplate.value = null
    showEditor.value = true
  }

  /** 只有草稿可编辑；发送后的消息通过撤回实现明确状态迁移。 */
  const openDispatch = (item?: NotificationDispatch): void => {
    editorKind.value = 'dispatch'
    editId.value = item?.id
    editRevision.value = item?.revision
    editor.value = item
      ? { ...item, name: '', enabled: true, channels: [...item.channels] }
      : createMessageEditor()
    audience.value = item?.audience ?? 'self'
    scheduledAt.value = item?.scheduledAt
      ? new Date(item.scheduledAt).getTime()
      : null
    selectedTemplate.value = item?.templateId ?? null
    showEditor.value = true
  }

  /** 应用模板只是复制内容，后续编辑不会污染模板。 */
  const applyTemplate = (): void => {
    const template = store.templates.find(
      item => item.id === selectedTemplate.value && item.enabled
    )
    if (!template) {
      message.warning('模板不存在或已停用')
      return
    }
    editor.value = {
      ...editor.value,
      title: template.title,
      content: template.content,
      category: template.category,
      priority: template.priority,
      channels: [...template.channels],
    }
  }

  /** 仅禁用过去的自然日，精确发送时间在保存与服务端再次校验。 */
  const isPastDay = (time: number): boolean =>
    time < new Date().setHours(0, 0, 0, 0)

  /** 表单验证完成后保存快照；草稿保存不会隐式发送。 */
  const saveEditor = async (model: MessageEditor): Promise<void> => {
    if (
      editorKind.value === 'dispatch' &&
      scheduledAt.value &&
      scheduledAt.value <= Date.now()
    ) {
      message.warning('定时发送时间必须晚于当前时间')
      throw new Error('定时发送时间必须晚于当前时间')
    }
    const saved = await run(
      () =>
        editorKind.value === 'template'
          ? store.saveTemplate({
              ...model,
              channels: [...model.channels],
              id: editId.value,
              revision: editRevision.value,
            })
          : store.saveDispatch({
              title: model.title,
              content: model.content,
              category: model.category,
              priority: model.priority,
              channels: [...model.channels],
              audience: audience.value,
              scheduledAt: scheduledAt.value
                ? new Date(scheduledAt.value).toISOString()
                : null,
              templateId: selectedTemplate.value ?? undefined,
              id: editId.value,
              revision: editRevision.value,
            }),
      editorKind.value === 'template'
        ? '模板已保存'
        : '草稿已保存，可在记录中确认发送'
    )
    if (saved) showEditor.value = false
  }
  const editorConfig = computed<FormConfig<MessageEditor>>(() => ({
    labelPlacement: 'top',
    showActions: false,
    onSubmit: payload => saveEditor(payload.model),
  }))

  /** 发送确认展示真实受众、通道和计划时间，重试不会重复创建消息。 */
  const confirmSend = (item: NotificationDispatch): void => {
    const scope =
      store.mode === 'demo' ? '仅本演示账户模拟接收' : '按所选受众发送'
    dialog.warning({
      title: item.scheduledAt ? '确认定时发送' : '确认发送消息',
      content: `“${item.title}”将${item.scheduledAt ? `于 ${formatMessageTime(item.scheduledAt)}` : '立即'}发送，${scope}。`,
      positiveText: '确认发送',
      negativeText: '取消',
      onPositiveClick: () =>
        run(
          () => store.sendDispatch(item.id, item.revision),
          item.scheduledAt
            ? '消息已加入发送计划'
            : store.mode === 'demo'
              ? '模拟发送已执行，请查看投递记录'
              : '发送请求已提交'
        ),
    })
  }

  /** 撤回会取消未来计划并更新已投递消息状态，审计记录保留。 */
  const confirmWithdraw = (item: NotificationDispatch): void => {
    dialog.warning({
      title: '撤回消息',
      content: '确认撤回此消息？已撤回记录仍会保留在投递和审计记录中。',
      positiveText: '确认撤回',
      negativeText: '取消',
      onPositiveClick: () =>
        run(() => store.withdrawDispatch(item.id, item.revision), '消息已撤回'),
    })
  }

  /** 删除模板须确认，不影响已经生成的发送记录。 */
  const confirmDelete = (item: NotificationTemplate): void => {
    dialog.warning({
      title: '删除模板',
      content: `确认删除模板“${item.name}”？已发送消息保持不变。`,
      positiveText: '删除模板',
      negativeText: '取消',
      onPositiveClick: () =>
        run(() => store.deleteTemplate(item.id, item.revision), '模板已删除'),
    })
  }

  /** 失败投递仅重试指定记录，避免重复发送成功通道。 */
  const retry = async (id: string): Promise<void> => {
    await run(() => store.retryDelivery(id), '已重试投递，请查看最新状态')
  }
  /** 独立刷新审计，不重置收件箱查询。 */
  const refreshAudit = async (): Promise<void> => {
    if (auditLoading.value) return
    auditLoading.value = true
    try {
      await store.listAudit()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '审计加载失败')
    } finally {
      auditLoading.value = false
    }
  }
  /** 演示通道送达明确标注模拟语义。 */
  const deliveryLabel = (status: NotificationDelivery['status']): string =>
    status === 'delivered' && store.mode === 'demo'
      ? '模拟送达'
      : DELIVERY_STATUS[status]
  /** 为治理表格创建一致的紧凑操作按钮。 */
  const button = (label: string, onClick: () => void, disabled = busy.value) =>
    h(
      NButton,
      { text: true, size: 'small', type: 'primary', disabled, onClick },
      { default: () => label }
    )
  const templateColumns = computed<TableColumn<NotificationTemplate>[]>(() => [
    { key: 'name', title: '模板名称', minWidth: 160 },
    { key: 'title', title: '标题', minWidth: 200 },
    {
      key: 'enabled',
      title: '状态',
      width: 90,
      render: row =>
        h(
          NTag,
          {
            type: row.enabled ? 'success' : 'default',
            bordered: false,
            size: 'small',
          },
          { default: () => (row.enabled ? '已启用' : '已停用') }
        ),
    },
    {
      key: 'updatedAt',
      title: '更新时间',
      width: 180,
      render: row => formatMessageTime(row.updatedAt),
    },
    {
      key: 'actions',
      title: '操作',
      width: 130,
      render: row =>
        h(
          NSpace,
          {},
          {
            default: () => [
              button('编辑', () => openTemplate(row)),
              button('删除', () => confirmDelete(row)),
            ],
          }
        ),
    },
  ])
  const dispatchColumns = computed<TableColumn<NotificationDispatch>[]>(() => [
    { key: 'title', title: '标题', minWidth: 220 },
    {
      key: 'status',
      title: '状态',
      width: 120,
      render: row =>
        h(
          NTag,
          {
            type:
              row.status === 'sent'
                ? 'success'
                : row.status === 'scheduled'
                  ? 'warning'
                  : 'default',
            size: 'small',
            bordered: false,
          },
          { default: () => DISPATCH_STATUS[row.status] }
        ),
    },
    {
      key: 'channels',
      title: '通道',
      minWidth: 160,
      render: row =>
        row.channels
          .map(channel => getOptionLabel(CHANNEL_OPTIONS, channel))
          .join(' / '),
    },
    {
      key: 'scheduledAt',
      title: '计划时间',
      width: 180,
      render: row =>
        row.scheduledAt ? formatMessageTime(row.scheduledAt) : '立即发送',
    },
    {
      key: 'actions',
      title: '操作',
      width: 260,
      render: row =>
        h(
          NSpace,
          {},
          {
            default: () => [
              ...(row.status === 'draft'
                ? [
                    button('编辑', () => openDispatch(row)),
                    button('发送', () => confirmSend(row)),
                  ]
                : []),
              ...(['sent', 'scheduled'].includes(row.status)
                ? [button('撤回', () => confirmWithdraw(row))]
                : []),
              button('投递记录', () => {
                deliveryDispatchId.value = row.id
              }),
            ],
          }
        ),
    },
  ])
  const auditColumns: TableColumn<NotificationAudit>[] = [
    {
      key: 'action',
      title: '操作',
      width: 160,
      render: row => AUDIT_ACTION_LABELS[row.action] ?? row.action,
    },
    {
      key: 'resourceId',
      title: '目标记录',
      width: 210,
      ellipsis: { tooltip: true },
    },
    { key: 'detail', title: '说明', minWidth: 260 },
    { key: 'actorId', title: '操作人', width: 140 },
    {
      key: 'at',
      title: '时间',
      width: 180,
      render: row => formatMessageTime(row.at),
    },
  ]
  watch(
    () => store.scopeKey,
    () => {
      showEditor.value = false
      showPreview.value = false
      deliveryDispatchId.value = null
    }
  )
  return {
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
  }
}
