/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\useMenuManagement.ts
 * @Description: 菜单工作区状态、校验、请求与导航缓存同步
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ApiResponse } from '@/api/management.contract'
import type {
  FormInstance,
  FormConfig,
  SubmitEventPayload,
} from '@robot-admin/naive-ui-components/C_Form'

import type { FormItemRule, DialogReactive, DialogOptions } from 'naive-ui/es'
import type { TreeExpose } from '@robot-admin/naive-ui-components/C_Tree'
import {
  defineActions,
  type ActionItem,
} from '@robot-admin/naive-ui-components/C_ActionBar'
import type { DropInfo } from '@robot-admin/naive-ui-components'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { isMockDataMode } from '@/config/dataMode'
import { s_userStore } from '@/stores/user'
import { s_permissionStore } from '@/stores/permission'
import { filterMenus, getParentOptions } from './d_menuTree'
import { useMenuNavigationSync } from './useMenuNavigationSync'
import { DEFAULT_FORM_DATA, MENU_STATUS_CONFIGS } from './data'
import type {
  MenuData,
  MenuFormData,
  ButtonPermission,
} from '@/api/menu-manage.contract'
import { flattenMenus, findMenu, validateMenuDraft } from '@/api/d_menu'
import {
  getMenuListApi,
  getButtonPermissionsApi,
  addMenuApi,
  updateMenuApi,
  deleteMenuApi,
  moveMenuApi,
  addButtonPermissionApi,
  updateButtonPermissionApi,
  deleteButtonPermissionApi,
} from '@/api/menu-manage'

const describeError = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

const checkResponse = <T>(response: ApiResponse<T>): T => {
  if (!['0', '200'].includes(String(response.code)))
    throw new Error(response.msg || '请求失败')
  return response.data
}

export const useMenuManagement = () => {
  const message = useMessage()
  const dialog = useDialog()
  const confirms = new Set<DialogReactive>()
  const confirmDeletion = (options: DialogOptions) => {
    const confirm = dialog.warning({
      ...options,
      onPositiveClick: event =>
        confirms.has(confirm) ? options.onPositiveClick?.(event) : false,
      onAfterLeave: () => confirms.delete(confirm),
    })
    confirms.add(confirm)
  }
  const dismissConfirms = () => {
    for (const confirm of confirms) confirm.destroy()
    confirms.clear()
  }
  let alive = true
  onScopeDispose(() => {
    alive = false
    dismissConfirms()
  })
  const userStore = s_userStore()
  const permissionStore = s_permissionStore()
  const currentContextId = () => userStore.activeContext?.id || 'default'
  const captureSession = () => {
    const generation = permissionStore.requestGeneration
    const context = currentContextId()
    return () =>
      alive &&
      permissionStore.requestGeneration === generation &&
      currentContextId() === context
  }
  const menuRequest = useLatestRequest()
  const buttonRequest = useLatestRequest()
  const { loading } = menuRequest
  const { loading: permissionsLoading } = buttonRequest
  const loadError = ref('')
  const permissionsError = ref('')
  const saving = ref(false)
  const mutating = ref(false)
  const navigation = useMenuNavigationSync(() => busy.value)
  const searchPattern = ref('')
  const showModal = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance<MenuFormData> | null>(null)
  const treeRef = ref<TreeExpose<MenuData> | null>(null)
  const menuList = ref<MenuData[]>([])
  const selectedId = ref<string | null>(null)
  const buttonPermissions = ref<ButtonPermission[]>([])
  const formData = reactive<MenuFormData>({ ...DEFAULT_FORM_DATA })
  const allMenus = computed(() => flattenMenus(menuList.value))
  const selectedMenu = computed(() =>
    findMenu(menuList.value, selectedId.value)
  )
  const filteredMenuList = computed(() =>
    filterMenus(menuList.value, searchPattern.value)
  )
  const parentMenuOptions = computed(() =>
    getParentOptions(menuList.value, formData)
  )
  const busy = computed(
    () => saving.value || mutating.value || navigation.syncing
  )
  const stats = computed(() => ({
    directories: allMenus.value.filter(menu => menu.type === 'directory')
      .length,
    pages: allMenus.value.filter(menu => menu.type === 'menu').length,
    cached: allMenus.value.filter(
      menu => menu.type === 'menu' && menu.keepAlive
    ).length,
  }))
  const breadcrumbs = computed(() => {
    const names: string[] = []
    let node = selectedMenu.value
    const visited = new Set<string>()
    while (node && !visited.has(node.id)) {
      visited.add(node.id)
      names.unshift(node.name)
      node = findMenu(menuList.value, node.parentId)
    }
    return names
  })
  const selectedPath = computed(() => {
    const segments: string[] = []
    const visited = new Set<string>()
    let node = selectedMenu.value
    while (node && !visited.has(node.id)) {
      visited.add(node.id)
      segments.unshift(node.path || '')
      node = findMenu(menuList.value, node.parentId)
    }
    return segments
      .reduce(
        (parent, path) => (path.startsWith('/') ? path : `${parent}/${path}`),
        ''
      )
      .replace(/\/{2,}/g, '/')
  })
  /** 字段级规则使用组件当前模型，复用原有领域约束。 */
  const fieldRules = (
    field: keyof MenuFormData,
    model: MenuFormData
  ): FormItemRule[] => [
    {
      trigger: ['input', 'blur', 'change'],
      validator: () => {
        const error = validateMenuDraft(
          model,
          menuList.value,
          buttonPermissions.value
        )[field]
        return error ? new Error(error) : true
      },
    },
  ]
  const modalTitle = computed(
    () =>
      `${modalMode.value === 'add' ? '新增' : '编辑'}${formData.type === 'button' ? '按钮权限' : '菜单'}`
  )
  const menuIconConfig = {
    typeMap: {
      directory: 'mdi:folder-outline',
      menu: 'mdi:file-document-outline',
      button: 'mdi:shield-key-outline',
    },
  }
  const treeActions = [
    {
      key: 'add',
      text: '新增下级',
      icon: 'mdi:plus',
      show: (node: { type?: unknown }) =>
        node.type === 'directory' && !busy.value,
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
  const getMenuTypeText = (type: MenuData['type']) =>
    ({ directory: '目录', menu: '页面', button: '按钮' })[type]
  const getMenuTypeColor = (type: MenuData['type']) =>
    (({ directory: 'info', menu: 'success', button: 'warning' }) as const)[type]

  const loadPermissions = async (): Promise<void> => {
    const id =
      selectedMenu.value?.type === 'menu' ? selectedMenu.value.id : undefined
    buttonRequest.cancel()
    buttonPermissions.value = []
    permissionsError.value = ''
    if (!id) return
    const isCurrent = captureSession()
    try {
      const response = await buttonRequest.run(signal =>
        getButtonPermissionsApi(id, signal)
      )
      if (response && isCurrent() && selectedId.value === id)
        buttonPermissions.value = checkResponse(response)
    } catch (error) {
      if (isCurrent() && selectedId.value === id)
        permissionsError.value = describeError(error, '加载按钮权限失败')
    }
  }
  watch(selectedId, () => {
    void loadPermissions()
  })

  const selectMenu = async (id: string): Promise<void> => {
    selectedId.value = id
    await nextTick()
    if (selectedId.value !== id) return
    treeRef.value?.selectNode(id)
    if (treeRef.value) {
      // C_Tree 的公开 exposed refs 在组件实例上自动解包。
      const ancestorIds: string[] = []
      let parent = findMenu(
        menuList.value,
        findMenu(menuList.value, id)?.parentId
      )
      while (parent && !ancestorIds.includes(parent.id)) {
        ancestorIds.push(parent.id)
        parent = findMenu(menuList.value, parent.parentId)
      }
      treeRef.value.expandedKeys = [
        ...new Set([...treeRef.value.expandedKeys, ...ancestorIds]),
      ]
    }
  }
  const handleNodeSelect = (_node: unknown, keys: (string | number)[]) => {
    selectedId.value = keys[0] == null ? null : String(keys[0])
  }
  let expandedBeforeSearch: (string | number)[] | undefined
  watch(
    () => [searchPattern.value, menuList.value] as const,
    async ([keyword], [previous]) => {
      if (!previous.trim() && keyword.trim())
        expandedBeforeSearch = [...(treeRef.value?.expandedKeys || [])]
      await nextTick()
      if (keyword.trim()) treeRef.value?.expandAll()
      else if (treeRef.value && expandedBeforeSearch) {
        treeRef.value.expandedKeys = expandedBeforeSearch
        expandedBeforeSearch = undefined
        if (selectedId.value) await selectMenu(selectedId.value)
      }
    }
  )
  const expanded = ref(false)
  const toggleExpansion = () => {
    expanded.value = !expanded.value
    if (expanded.value) treeRef.value?.expandAll()
    else treeRef.value?.collapseAll()
  }

  const chooseSelection = (): string | undefined =>
    findMenu(menuList.value, selectedId.value)?.id ||
    findMenu(menuList.value, 'sys-menu-manage')?.id ||
    menuList.value[0]?.id

  const loadMenus = async (): Promise<boolean> => {
    const isCurrent = captureSession()
    loadError.value = ''
    try {
      const contextId = currentContextId()
      const response = await menuRequest.run(signal =>
        getMenuListApi(signal, contextId)
      )
      if (!response || !isCurrent()) return false
      menuList.value = checkResponse(response)
      const id = chooseSelection()
      if (id) await selectMenu(id)
      else selectedId.value = null
      return true
    } catch (error) {
      if (isCurrent()) loadError.value = describeError(error, '加载菜单失败')
      return false
    }
  }
  const refreshMenus = async () => {
    const isCurrent = captureSession()
    if (await loadMenus()) {
      if (!isCurrent()) return
      await loadPermissions()
      if (isCurrent()) message.success('菜单已刷新')
    }
  }
  const resetForm = () => {
    delete formData.id
    delete formData.revision
    Object.assign(formData, DEFAULT_FORM_DATA)
    formRef.value?.clearValidation()
  }
  const handleAddMenu = (parentId?: string) => {
    if (busy.value) return
    resetForm()
    modalMode.value = 'add'
    formData.parentId = parentId || null
    formData.sort =
      ((parentId
        ? findMenu(menuList.value, parentId)?.children
        : menuList.value
      )?.length || 0) + 1
    showModal.value = true
  }
  const handleAddPermission = () => {
    const menu = selectedMenu.value
    if (
      !menu ||
      menu.type !== 'menu' ||
      busy.value ||
      permissionsLoading.value ||
      permissionsError.value
    )
      return
    resetForm()
    modalMode.value = 'add'
    formData.type = 'button'
    formData.parentId = menu.id
    showModal.value = true
  }
  const handleEditMenu = (menu: MenuData) => {
    if (busy.value) return
    resetForm()
    modalMode.value = 'edit'
    Object.assign(formData, menu, {
      path: menu.path || '',
      component: menu.component || '',
      icon: menu.icon || '',
      permission: menu.permission || '',
      remark: menu.remark || '',
      keepAlive: menu.keepAlive === true,
    })
    showModal.value = true
  }
  const handleEditPermission = (permission: ButtonPermission) => {
    if (busy.value) return
    resetForm()
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: permission.id,
      revision: permission.revision,
      name: permission.name,
      type: 'button',
      parentId: permission.menuId,
      permission: permission.permission,
      remark: permission.remark || '',
    })
    showModal.value = true
  }
  const handleCancelModal = () => {
    if (!saving.value) showModal.value = false
  }
  const snapshotDraft = (model: MenuFormData): MenuFormData => {
    const draft = Object.fromEntries(
      Object.keys(DEFAULT_FORM_DATA).map(key => [
        key,
        model[key as keyof MenuFormData],
      ])
    ) as unknown as MenuFormData
    if (model.id) {
      draft.id = model.id
      draft.revision = model.revision
    }
    for (const field of [
      'name',
      'path',
      'component',
      'icon',
      'permission',
      'remark',
    ] as const)
      draft[field] = draft[field].trim()
    return draft
  }
  const saveDraft = async (
    draft: MenuFormData,
    contextId: string
  ): Promise<boolean> => {
    if (draft.type === 'button') {
      const permission = {
        id: draft.id,
        revision: draft.revision,
        menuId: draft.parentId!,
        name: draft.name,
        permission: draft.permission,
        remark: draft.remark,
      }
      if (draft.id)
        await updateButtonPermissionApi(permission as ButtonPermission)
      else await addButtonPermissionApi(permission)
      return false
    } else {
      const changedCache =
        findMenu(menuList.value, draft.id)?.keepAlive !== draft.keepAlive
      if (draft.id) await updateMenuApi(draft, contextId)
      else await addMenuApi(draft)
      return !!draft.id && changedCache
    }
  }
  const formConfig = computed<FormConfig<MenuFormData>>(() => ({
    layout: 'grid',
    grid: { cols: 3, gutter: 16 },
    labelPlacement: 'top',
    showActions: false,
    disabled: saving.value,
    preserveRemovedFields: true,
    onSubmit: submitDraft,
  }))
  /** 统一入口复用组件的校验和提交锁，保留领域提交与导航同步。 */
  const handleSaveMenu = () =>
    busy.value
      ? Promise.resolve(false)
      : (formRef.value?.submit() ?? Promise.resolve(false))
  /** 提交领域数据，保留鉴权上下文与列表同步。 */
  async function submitDraft({
    model,
  }: SubmitEventPayload<MenuFormData>): Promise<void> {
    saving.value = true
    const draft = snapshotDraft(model)
    const contextId = currentContextId()
    const isCurrent = captureSession()
    try {
      const changedCache = await saveDraft(draft, contextId)
      if (!isCurrent()) return
      message.success('配置已保存')
      if (draft.type === 'button') await loadPermissions()
      else {
        navigation.markChanged(changedCache)
        await loadMenus()
      }
    } catch (error) {
      if (isCurrent()) throw new Error(describeError(error, '保存失败，请重试'))
    } finally {
      saving.value = false
    }
  }
  const handleDeleteMenu = (menu: MenuData) => {
    if (busy.value) return
    const isCurrent = captureSession()
    const descendants = flattenMenus(menu.children || []).length
    confirmDeletion({
      title: `删除“${menu.name}”？`,
      content: descendants
        ? `将同时删除 ${descendants} 个下级节点及关联按钮权限，此操作不可撤销。`
        : '关联的按钮权限也会删除，此操作不可撤销。',
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (busy.value || !isCurrent()) return false
        mutating.value = true
        try {
          await deleteMenuApi(menu.id, menu.revision)
          if (!isCurrent()) return false
          navigation.markChanged()
          await loadMenus()
          if (isCurrent()) message.success('菜单已删除')
        } catch (error) {
          if (isCurrent()) message.error(describeError(error, '删除失败'))
          return false
        } finally {
          mutating.value = false
        }
      },
    })
  }
  const handleDeletePermission = (permission: ButtonPermission) => {
    const isCurrent = captureSession()
    confirmDeletion({
      title: `删除权限“${permission.name}”？`,
      content: permission.permission,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (busy.value || !isCurrent()) return false
        mutating.value = true
        try {
          await deleteButtonPermissionApi(permission.id, permission.revision)
          if (!isCurrent()) return false
          await loadPermissions()
          if (isCurrent()) message.success('权限已删除')
        } catch (error) {
          if (isCurrent()) message.error(describeError(error, '删除失败'))
          return false
        } finally {
          mutating.value = false
        }
      },
    })
  }
  const handleNodeAction = (action: string, node: unknown) => {
    const menu = findMenu(menuList.value, (node as MenuData).id)
    if (!menu) return
    if (action === 'edit') handleEditMenu(menu)
    if (action === 'delete') handleDeleteMenu(menu)
    if (action === 'add' && menu.type === 'directory') handleAddMenu(menu.id)
  }
  const moveMenuNode = ({
    node,
    dragNode,
    dropPosition,
  }: DropInfo<MenuData>) => {
    const source = findMenu(menuList.value, String(dragNode.id))
    const target = findMenu(menuList.value, String(node.id))
    if (!source || !target) throw new Error('菜单节点不存在')
    const parentId = dropPosition === 'inside' ? target.id : target.parentId
    const errors = validateMenuDraft(
      { ...DEFAULT_FORM_DATA, ...source, parentId },
      menuList.value
    )
    if (errors.parentId) throw new Error(errors.parentId)
    return moveMenuApi(source.id, target.id, dropPosition, source.revision)
  }
  const handleNodeDrop = async (drop: DropInfo<MenuData>) => {
    if (busy.value || searchPattern.value.trim()) return
    const isCurrent = captureSession()
    mutating.value = true
    try {
      await moveMenuNode(drop)
      if (!isCurrent()) return
      navigation.markChanged()
      message.success('菜单顺序已更新')
    } catch (error) {
      if (isCurrent())
        message.error(describeError(error, '移动失败，已恢复顺序'))
    } finally {
      if (isCurrent()) await loadMenus()
      mutating.value = false
    }
  }
  // 菜单加载失败时仍可重试；新增依赖已加载的菜单树。
  const toolbarActions = defineActions([
    {
      key: 'refresh',
      disabled: () => busy.value || loading.value,
      onClick: refreshMenus,
    },
    {
      key: 'sync',
      label: '同步导航',
      icon: 'mdi:sync',
      disabled: () => busy.value || loading.value,
      onClick: navigation.sync,
    },
    {
      key: 'add',
      label: '新增菜单',
      disabled: () => busy.value || loading.value || !!loadError.value,
      onClick: handleAddMenu,
    },
  ])
  const getPermissionActions = (permission: ButtonPermission): ActionItem[] => [
    {
      key: 'edit',
      disabled: busy,
      onClick: () => handleEditPermission(permission),
    },
    {
      key: 'delete',
      disabled: busy,
      onClick: () => handleDeletePermission(permission),
    },
  ]
  watch(
    () => formData.type,
    () => {
      formRef.value?.clearValidation()
    }
  )
  onMounted(() => {
    void loadMenus()
  })
  onDeactivated(() => {
    showModal.value = false
    dismissConfirms()
  })
  return {
    busy,
    mutating,
    formRef,
    treeRef,
    navigation,
    menuStatusConfigs: MENU_STATUS_CONFIGS,
    isMock: isMockDataMode(),
    toolbarActions,
    handleDeleteMenu,
    tree: proxyRefs({
      loading,
      error: loadError,
      search: searchPattern,
      rows: filteredMenuList,
      stats,
      actions: treeActions,
      iconConfig: menuIconConfig,
      expanded,
      select: selectMenu,
      onSelect: handleNodeSelect,
      onAction: handleNodeAction,
      onDrop: handleNodeDrop,
      toggleExpansion,
      load: loadMenus,
    }),
    selection: proxyRefs({
      menu: selectedMenu,
      breadcrumbs,
      path: selectedPath,
      getTypeText: getMenuTypeText,
      getTypeColor: getMenuTypeColor,
    }),
    buttons: proxyRefs({
      loading: permissionsLoading,
      error: permissionsError,
      rows: buttonPermissions,
      actions: getPermissionActions,
      load: loadPermissions,
    }),
    editor: proxyRefs({
      model: formData,
      rules: fieldRules,
      config: formConfig,
      parentOptions: parentMenuOptions,
      visible: showModal,
      title: modalTitle,
      mode: modalMode,
      saving,
      add: handleAddMenu,
      addPermission: handleAddPermission,
      edit: handleEditMenu,
      save: handleSaveMenu,
      cancel: handleCancelModal,
    }),
  }
}
