/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\sys-manage\dictionary-manage\useDictionaryManagement.ts
 * @Description: 字典工作区选择、编辑校验与请求生命周期
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ApiResponse } from '@/api/management.contract'
import type {
  FormInstance,
  FormConfig,
} from '@robot-admin/naive-ui-components/C_Form'
import type { DialogReactive, FormItemRule } from 'naive-ui/es'
import type { C_Tree } from '@robot-admin/naive-ui-components/C_Tree'
import type { ActionItem } from '@robot-admin/naive-ui-components'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { isMockDataMode } from '@/config/dataMode'
import { s_userStore } from '@/stores/user'
import { s_permissionStore } from '@/stores/permission'
import {
  filterDictionaries,
  getDictionaryState,
  findDictionary,
  flattenDictionaries,
  prepareDictionaryForm,
  validateDictionaryForm,
} from './d_dictionary'
import {
  DEFAULT_DICT_FORM_DATA,
  DICT_STATUS_CONFIGS,
  addDictApi,
  deleteDictApi,
  getDictListApi,
  toggleDictStatusApi,
  updateDictApi,
  type DictData,
  type DictFormData,
} from './data'

const describeError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const sortDictionaries = (dicts: DictData[]): DictData[] =>
  [...dicts]
    .sort((a, b) => a.sort - b.sort)
    .map(dict => ({
      ...dict,
      children: dict.children ? sortDictionaries(dict.children) : undefined,
    }))

export const useDictionaryManagement = () => {
  const message = useMessage()
  const dialog = useDialog()
  const userStore = s_userStore()
  const permissionStore = s_permissionStore()
  const request = useLatestRequest()
  const { loading } = request
  const dictList = ref<DictData[]>([])
  const loadError = ref('')
  const searchPattern = ref('')
  const selectedId = ref<string | null>(null)
  const treeRef = ref<InstanceType<typeof C_Tree> | null>(null)
  const formRef = ref<FormInstance<DictFormData> | null>(null)
  const showModal = ref(false)
  const formData = reactive<DictFormData>({ ...DEFAULT_DICT_FORM_DATA })
  const saving = ref(false)
  const mutating = ref(false)
  const busy = computed(() => saving.value || mutating.value)
  const confirms = new Set<DialogReactive>()
  let alive = true
  const contextId = () => userStore.activeContext?.id
  const isCurrentSession = (generation: number, context: string | undefined) =>
    alive &&
    permissionStore.requestGeneration === generation &&
    contextId() === context
  const dismissConfirms = () => {
    for (const confirm of confirms) confirm.destroy()
    confirms.clear()
  }
  onScopeDispose(() => {
    alive = false
    dismissConfirms()
  })
  onDeactivated(() => {
    showModal.value = false
    dismissConfirms()
  })

  const selectedDict = computed(() =>
    findDictionary(dictList.value, selectedId.value)
  )
  const selectedType = computed(() => {
    const dict = selectedDict.value
    return dict?.type === 'type'
      ? dict
      : findDictionary(dictList.value, dict?.parentId)
  })
  const dictItems = computed(() => selectedType.value?.children || [])
  const filteredDictList = computed(() =>
    filterDictionaries(dictList.value, searchPattern.value)
  )
  const stats = computed(() => ({
    types: dictList.value.length,
    items: flattenDictionaries(dictList.value).filter(
      dict => dict.type === 'item'
    ).length,
  }))

  const readDictionaryList = (
    response: ApiResponse<DictData[]>
  ): DictData[] => {
    if (
      !['0', '200'].includes(String(response.code)) ||
      !Array.isArray(response.data)
    )
      throw new Error(response.msg || '字典列表返回异常')
    return sortDictionaries(response.data)
  }
  const enabledItems = computed(() =>
    selectedType.value?.status === 1
      ? dictItems.value.filter(item => item.status === 1).length
      : 0
  )
  const parentOptions = computed(() =>
    dictList.value.map(dict => ({
      label: `${dict.name} · ${dict.code}${dict.status === 0 ? '（已停用）' : ''}`,
      value: dict.id,
      disabled:
        dict.status === 0 &&
        dict.id !== findDictionary(dictList.value, formData.id)?.parentId,
    }))
  )
  const formItemState = computed(() =>
    getDictionaryState(
      formData,
      findDictionary(dictList.value, formData.parentId)
    )
  )
  /** 字段级规则使用组件当前模型，复用原有领域约束。 */
  const fieldRules = (
    field: keyof DictFormData,
    model: DictFormData
  ): FormItemRule[] => [
    {
      trigger: ['input', 'blur', 'change'],
      validator: () => {
        const error = validateDictionaryForm(model, dictList.value)[field]
        return error ? new Error(error) : true
      },
    },
  ]
  const modalTitle = computed(
    () =>
      `${formData.id ? '编辑' : '新增'}${formData.type === 'type' ? '字典类型' : '字典项'}`
  )

  const selectDict = async (id: string) => {
    selectedId.value = id
    await nextTick()
    treeRef.value?.selectNode(id)
    const parentId = findDictionary(dictList.value, id)?.parentId
    if (parentId && treeRef.value)
      treeRef.value.expandedKeys = [
        ...new Set([...treeRef.value.expandedKeys, parentId]),
      ]
  }
  const handleNodeSelect = (_node: unknown, keys: (string | number)[]) => {
    // 再次点击已选节点不会清空右侧工作区。
    if (keys[0] != null) selectedId.value = String(keys[0])
  }
  const loadDicts = async (
    preferredId = selectedId.value
  ): Promise<boolean> => {
    loadError.value = ''
    const generation = permissionStore.requestGeneration
    const context = contextId()
    try {
      const response = await request.run(signal => getDictListApi(signal))
      if (!response || !isCurrentSession(generation, context)) return false
      dictList.value = readDictionaryList(response)
      const id =
        findDictionary(dictList.value, preferredId)?.id || dictList.value[0]?.id
      if (id) await selectDict(id)
      else selectedId.value = null
      return true
    } catch (error) {
      if (isCurrentSession(generation, context))
        loadError.value = describeError(error, '字典加载失败')
      return false
    }
  }
  let expandedBeforeSearch: (string | number)[] | undefined
  watch(
    () => [searchPattern.value, dictList.value] as const,
    async ([keyword], [previous]) => {
      if (!previous.trim() && keyword.trim())
        expandedBeforeSearch = [...(treeRef.value?.expandedKeys || [])]
      await nextTick()
      if (keyword.trim()) treeRef.value?.expandAll()
      else if (treeRef.value && expandedBeforeSearch) {
        treeRef.value.expandedKeys = expandedBeforeSearch
        expandedBeforeSearch = undefined
      }
    }
  )
  const expanded = ref(false)
  const toggleExpansion = () => {
    expanded.value = !expanded.value
    if (expanded.value) treeRef.value?.expandAll()
    else treeRef.value?.collapseAll()
  }
  const resetForm = () => {
    delete formData.id
    Object.assign(formData, DEFAULT_DICT_FORM_DATA)
    formRef.value?.clearValidation()
  }
  const handleAdd = (parent?: DictData) => {
    if (busy.value || loading.value || loadError.value) return
    if (parent && parent.status === 0) return
    resetForm()
    if (parent) Object.assign(formData, { type: 'item', parentId: parent.id })
    const siblings = parent?.children || dictList.value
    formData.sort = Math.min(
      9999,
      Math.max(0, ...siblings.map(dict => dict.sort)) + 1
    )
    showModal.value = true
  }
  const handleEdit = (dict: DictData) => {
    if (busy.value || loadError.value) return
    resetForm()
    for (const key of Object.keys(
      DEFAULT_DICT_FORM_DATA
    ) as (keyof typeof DEFAULT_DICT_FORM_DATA)[])
      Object.assign(formData, {
        [key]: dict[key] ?? DEFAULT_DICT_FORM_DATA[key],
      })
    Object.assign(formData, {
      id: dict.id,
      typeCode: dict.type === 'type' ? dict.code : '',
      dictValue: dict.dictValue ?? dict.value ?? '',
      name: dict.dictLabel || dict.name,
    })
    showModal.value = true
  }
  const handleCancel = () => {
    if (!saving.value) showModal.value = false
  }
  const reloadSavedDraft = async (draft: DictFormData) => {
    const refreshed = await loadDicts(
      draft.type === 'item' ? draft.parentId : draft.id
    )
    if (!draft.id && draft.type === 'type' && refreshed) {
      const created = dictList.value.find(dict => dict.code === draft.typeCode)
      if (created) await selectDict(created.id)
    }
    return refreshed
  }
  const saveDraft = async (draft: DictFormData): Promise<boolean> => {
    const generation = permissionStore.requestGeneration
    const context = contextId()
    try {
      if (draft.id) await updateDictApi(draft)
      else await addDictApi(draft)
      if (!isCurrentSession(generation, context)) return false
      const refreshed = await reloadSavedDraft(draft)
      if (!isCurrentSession(generation, context)) return false
      if (refreshed) message.success('字典已保存')
      else message.warning('已保存，列表刷新失败，请重新加载')
      return true
    } catch (error) {
      if (isCurrentSession(generation, context))
        throw new Error(describeError(error, '保存失败，请重试'))
      return false
    }
  }
  const formConfig = computed<FormConfig<DictFormData>>(() => ({
    layout: 'grid',
    grid: { cols: 2, gutter: 16 },
    labelPlacement: 'top',
    showActions: false,
    disabled: saving.value,
    preserveRemovedFields: true,
    onSubmit: submitDraft,
  }))
  /** 统一入口复用组件的校验和提交锁，保留领域提交与导航同步。 */
  const handleSave = () =>
    busy.value
      ? Promise.resolve(false)
      : (formRef.value?.submit() ?? Promise.resolve(false))
  /** 提交领域数据，保留鉴权上下文与列表同步。 */
  async function submitDraft(): Promise<void> {
    saving.value = true
    try {
      if (!(await saveDraft(prepareDictionaryForm(formData))))
        throw new Error('字典保存未完成')
    } finally {
      saving.value = false
    }
  }
  const mutate = async (
    operation: () => Promise<void>,
    success: string,
    preferredId = selectedId.value
  ): Promise<boolean> => {
    if (busy.value || loading.value || loadError.value) return false
    mutating.value = true
    const generation = permissionStore.requestGeneration
    const context = contextId()
    try {
      await operation()
      if (!isCurrentSession(generation, context)) return false
      const refreshed = await loadDicts(preferredId)
      if (!isCurrentSession(generation, context)) return false
      if (refreshed) message.success(success)
      else message.warning('操作已成功，列表刷新失败，请重新加载')
      return true
    } catch (error) {
      if (isCurrentSession(generation, context))
        message.error(describeError(error, '操作失败，请重试'))
      return false
    } finally {
      mutating.value = false
    }
  }
  const handleToggle = (dict: DictData) =>
    mutate(
      () => toggleDictStatusApi(dict.id, dict.status === 1 ? 0 : 1),
      '字典状态已更新'
    )
  const handleDelete = (dict: DictData) => {
    if (busy.value || loadError.value) return
    const count = dict.children?.length || 0
    const confirm = dialog.warning({
      title: `删除“${dict.name}”？`,
      content: count
        ? `将同时删除 ${count} 个字典项。使用该字典的业务可能受影响，请确认后删除。`
        : '使用该选项的业务可能受影响，请确认后删除。',
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        const done = await mutate(
          () => deleteDictApi(dict.id),
          '字典已删除',
          dict.parentId || null
        )
        if (!done) return false
      },
      onAfterLeave: () => confirms.delete(confirm),
    })
    confirms.add(confirm)
  }
  const handleNodeAction = (action: string, node: unknown) => {
    const dict = findDictionary(dictList.value, (node as DictData).id)
    if (!dict) return
    if (action === 'add') handleAdd(dict)
    if (action === 'edit') handleEdit(dict)
    if (action === 'delete') handleDelete(dict)
    if (action === 'toggle') void handleToggle(dict)
  }
  const treeActions = [
    {
      key: 'add',
      text: '新增字典项',
      icon: 'mdi:plus',
      show: (node: { type?: unknown; status?: unknown }) =>
        node.type === 'type' && node.status === 1 && !busy.value,
    },
    {
      key: 'edit',
      text: '编辑',
      icon: 'mdi:pencil-outline',
      show: () => !busy.value,
    },
    {
      key: 'delete',
      text: '删除',
      icon: 'mdi:delete-outline',
      type: 'error' as const,
      show: () => !busy.value,
    },
  ]
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      disabled: busy.value || loading.value,
      onClick: async () => {
        if (await loadDicts()) message.success('字典已刷新')
      },
    },
    {
      key: 'add',
      label: '新增字典类型',
      icon: 'mdi:plus',
      type: 'primary',
      disabled: busy.value || loading.value || !!loadError.value,
      onClick: () => handleAdd(),
    },
  ])
  onMounted(() => {
    void loadDicts()
  })

  return {
    isMock: isMockDataMode(),
    loading,
    busy,
    saving,
    mutating,
    loadError,
    searchPattern,
    selectedId,
    selectedType,
    dictItems,
    filteredDictList,
    stats,
    enabledItems,
    treeRef,
    formRef,
    formData,
    fieldRules,
    formConfig,
    parentOptions,
    formItemState,
    showModal,
    modalTitle,
    expanded,
    toolbarActions,
    treeActions,
    statusConfigs: DICT_STATUS_CONFIGS,
    iconConfig: {
      typeMap: { type: 'mdi:folder-table-outline', item: 'mdi:tag-outline' },
    },
    loadDicts,
    selectDict,
    toggleExpansion,
    handleNodeSelect,
    handleNodeAction,
    handleAdd,
    handleEdit,
    handleCancel,
    handleSave,
    handleToggle,
    handleDelete,
  }
}
