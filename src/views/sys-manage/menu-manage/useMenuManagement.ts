/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\useMenuManagement.ts
 * @Description: 菜单工作区状态、校验、请求与导航缓存同步
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  FormInst,
  FormRules,
  DialogReactive,
  DialogOptions,
} from 'naive-ui/es'
import type { C_Tree } from '@robot-admin/naive-ui-components/C_Tree'
import type { ActionItem, DropInfo } from '@robot-admin/naive-ui-components'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { clearExistingRoutes, initDynamicRouter } from '@/router/dynamicRouter'
import { getAuthMenuListApi, type AuthMenuResponse } from '@/api/auth'
import { isMockDataMode } from '@/config/dataMode'
import { s_userStore } from '@/stores/user'
import { s_permissionStore } from '@/stores/permission'
import {
  flattenMenus,
  findMenu,
  filterMenus,
  getParentOptions,
  validateMenuDraft,
} from './d_menuTree'
import {
  type ApiResponse,
  type MenuData,
  type FormData,
  type ButtonPermission,
  DEFAULT_FORM_DATA,
  MENU_STATUS_CONFIGS,
  getMenuListApi,
  getButtonPermissionsApi,
  addMenuApi,
  updateMenuApi,
  deleteMenuApi,
  moveMenuApi,
  addButtonPermissionApi,
  updateButtonPermissionApi,
  deleteButtonPermissionApi,
} from './data'

const describeError = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

const checkResponse = <T>(response: ApiResponse<T>): T => {
  if (!['0', '200'].includes(String(response.code)))
    throw new Error(response.msg || '请求失败')
  return response.data
}

const checkNavigationResponse = (response: AuthMenuResponse): void => {
  if (!['0', '200'].includes(String(response.code)) || !response.data?.length)
    throw new Error(response.msg || response.message || '导航配置加载失败')
}

export const useMenuManagement = () => {
  const message = useMessage()
  const dialog = useDialog()
  const confirms = new Set<DialogReactive>()
  const confirmDeletion = (options: DialogOptions) => {
    const confirm = dialog.warning({
      ...options,
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
  const router = useRouter()
  const route = useRoute()
  const userStore = s_userStore()
  const permissionStore = s_permissionStore()
  const currentContextId = () => userStore.activeContext?.id || 'default'
  const isCurrentAuthSession = (
    generation: number,
    contextId = currentContextId()
  ) =>
    permissionStore.requestGeneration === generation &&
    currentContextId() === contextId
  const isCurrentSession = (
    generation: number,
    contextId = currentContextId()
  ) => alive && isCurrentAuthSession(generation, contextId)
  const menuRequest = useLatestRequest()
  const buttonRequest = useLatestRequest()
  const { loading } = menuRequest
  const { loading: permissionsLoading } = buttonRequest
  const loadError = ref('')
  const permissionsError = ref('')
  const saving = ref(false)
  const mutating = ref(false)
  const syncing = ref(false)
  const navigationDirty = ref(false)
  const searchPattern = ref('')
  const showModal = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const treeRef = ref<InstanceType<typeof C_Tree> | null>(null)
  const menuList = ref<MenuData[]>([])
  const selectedId = ref<string | null>(null)
  const buttonPermissions = ref<ButtonPermission[]>([])
  const formData = reactive<FormData>({ ...DEFAULT_FORM_DATA })
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
  const busy = computed(() => saving.value || mutating.value || syncing.value)
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
  const formRules = computed<FormRules>(() =>
    Object.fromEntries(
      [
        'name',
        'type',
        'sort',
        'parentId',
        'path',
        'component',
        'permission',
      ].map(field => [
        field,
        {
          trigger: ['input', 'blur', 'change'],
          validator: () => {
            const error = validateMenuDraft(
              formData,
              menuList.value,
              buttonPermissions.value
            )[field as keyof FormData]
            return error ? new Error(error) : true
          },
        },
      ])
    )
  )
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
    try {
      const response = await buttonRequest.run(signal =>
        getButtonPermissionsApi(id, signal)
      )
      if (response && selectedId.value === id)
        buttonPermissions.value = checkResponse(response)
    } catch (error) {
      if (selectedId.value === id)
        permissionsError.value = describeError(error, '加载按钮权限失败')
    }
  }
  watch(selectedId, () => {
    void loadPermissions()
  })

  const selectMenu = async (id: string): Promise<void> => {
    selectedId.value = id
    await nextTick()
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
    loadError.value = ''
    try {
      const contextId = currentContextId()
      const response = await menuRequest.run(signal =>
        getMenuListApi(signal, contextId)
      )
      if (!response) return false
      menuList.value = checkResponse(response)
      const id = chooseSelection()
      if (id) await selectMenu(id)
      else selectedId.value = null
      return true
    } catch (error) {
      loadError.value = describeError(error, '加载菜单失败')
      return false
    }
  }
  const refreshMenus = async () => {
    if (await loadMenus()) {
      await loadPermissions()
      message.success('菜单已刷新')
    }
  }
  const resetForm = () => {
    delete formData.id
    Object.assign(formData, DEFAULT_FORM_DATA)
    formRef.value?.restoreValidation()
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
  const snapshotDraft = (): FormData => {
    const draft = Object.fromEntries(
      Object.keys(DEFAULT_FORM_DATA).map(key => [
        key,
        formData[key as keyof FormData],
      ])
    ) as unknown as FormData
    if (formData.id) draft.id = formData.id
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
    draft: FormData,
    contextId: string
  ): Promise<void> => {
    if (draft.type === 'button') {
      const permission = {
        id: draft.id,
        menuId: draft.parentId!,
        name: draft.name,
        permission: draft.permission,
        remark: draft.remark,
      }
      if (draft.id)
        await updateButtonPermissionApi(permission as ButtonPermission)
      else await addButtonPermissionApi(permission)
    } else {
      const changedCache =
        findMenu(menuList.value, draft.id)?.keepAlive !== draft.keepAlive
      if (draft.id) await updateMenuApi(draft, contextId)
      else await addMenuApi(draft)
      navigationDirty.value ||=
        !isMockDataMode() || (!!draft.id && changedCache)
    }
  }
  const handleSaveMenu = async (): Promise<boolean> => {
    if (busy.value || !formRef.value) return false
    try {
      await formRef.value.validate()
    } catch {
      return false
    }
    if (busy.value) return false
    saving.value = true
    const draft = snapshotDraft()
    const contextId = currentContextId()
    const generation = permissionStore.requestGeneration
    try {
      await saveDraft(draft, contextId)
      if (!isCurrentSession(generation)) return true
      showModal.value = false
      message.success('配置已保存')
      if (draft.type === 'button') await loadPermissions()
      else await loadMenus()
      return true
    } catch (error) {
      if (isCurrentSession(generation))
        message.error(describeError(error, '保存失败，请重试'))
      return false
    } finally {
      saving.value = false
    }
  }
  const handleDeleteMenu = (menu: MenuData) => {
    if (busy.value) return
    const generation = permissionStore.requestGeneration
    const descendants = flattenMenus(menu.children || []).length
    confirmDeletion({
      title: `删除“${menu.name}”？`,
      content: descendants
        ? `将同时删除 ${descendants} 个下级节点及关联按钮权限，此操作不可撤销。`
        : '关联的按钮权限也会删除，此操作不可撤销。',
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (busy.value) return false
        mutating.value = true
        try {
          await deleteMenuApi(menu.id)
          if (!isCurrentSession(generation)) return false
          navigationDirty.value ||= !isMockDataMode()
          await loadMenus()
          message.success('菜单已删除')
        } catch (error) {
          message.error(describeError(error, '删除失败'))
          return false
        } finally {
          mutating.value = false
        }
      },
    })
  }
  const handleDeletePermission = (permission: ButtonPermission) => {
    const generation = permissionStore.requestGeneration
    confirmDeletion({
      title: `删除权限“${permission.name}”？`,
      content: permission.permission,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (busy.value) return false
        mutating.value = true
        try {
          await deleteButtonPermissionApi(permission.id)
          if (!isCurrentSession(generation)) return false
          await loadPermissions()
          message.success('权限已删除')
        } catch (error) {
          message.error(describeError(error, '删除失败'))
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
  const handleNodeDrop = async ({ node, dragNode, dropPosition }: DropInfo) => {
    if (busy.value || searchPattern.value.trim()) return
    mutating.value = true
    try {
      const source = findMenu(menuList.value, String(dragNode.id))
      const target = findMenu(menuList.value, String(node.id))
      if (!source || !target) throw new Error('菜单节点不存在')
      const parentId = dropPosition === 'inside' ? target.id : target.parentId
      const errors = validateMenuDraft(
        { ...DEFAULT_FORM_DATA, ...source, parentId },
        menuList.value
      )
      if (errors.parentId) throw new Error(errors.parentId)
      await moveMenuApi(source.id, target.id, dropPosition)
      navigationDirty.value ||= !isMockDataMode()
      message.success('菜单顺序已更新')
    } catch (error) {
      message.error(describeError(error, '移动失败，已恢复顺序'))
    } finally {
      await loadMenus()
      mutating.value = false
    }
  }
  const syncNavigation = async () => {
    if (busy.value) return
    syncing.value = true
    const currentPath = route.fullPath
    const context = userStore.activeContext
    const generation = permissionStore.requestGeneration
    try {
      // 先验证接口可用，再清理缓存；失败时保留当前可用导航。
      const response = await getAuthMenuListApi(context)
      checkNavigationResponse(response)
      if (!isCurrentAuthSession(generation, context?.id)) return
      clearExistingRoutes()
      permissionStore.resetPermissions()
      if (!(await initDynamicRouter())) throw new Error('同步失败，请重试')
      // 同步本身会重建布局，允许旧组件销毁后完成本次同会话导航。
      if (!isCurrentAuthSession(generation + 1, context?.id)) return
      await router.replace(
        permissionStore.hasRoutePermission(route.path) ? currentPath : '/home'
      )
      message.success(
        isMockDataMode() ? '页面缓存配置已应用' : '导航与页面缓存配置已应用'
      )
    } catch (error) {
      message.error(describeError(error, '同步失败，请重试'))
    } finally {
      syncing.value = false
    }
  }
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      disabled: busy.value || loading.value,
      onClick: refreshMenus,
    },
    {
      key: 'sync',
      label: '同步导航',
      icon: 'mdi:sync',
      disabled: busy.value || loading.value,
      onClick: syncNavigation,
    },
    {
      key: 'add',
      label: '新增菜单',
      icon: 'mdi:plus',
      type: 'primary',
      disabled: busy.value || loading.value || !!loadError.value,
      onClick: () => handleAddMenu(),
    },
  ])
  const getPermissionActions = (permission: ButtonPermission): ActionItem[] => [
    {
      key: 'edit',
      label: '编辑',
      icon: 'mdi:pencil-outline',
      disabled: busy.value,
      onClick: () => handleEditPermission(permission),
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'mdi:delete-outline',
      type: 'error',
      disabled: busy.value,
      onClick: () => handleDeletePermission(permission),
    },
  ]
  watch(
    () => formData.type,
    () => {
      formRef.value?.restoreValidation()
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
    loading,
    loadError,
    permissionsLoading,
    permissionsError,
    saving,
    mutating,
    busy,
    syncing,
    navigationDirty,
    searchPattern,
    showModal,
    modalMode,
    modalTitle,
    formRef,
    treeRef,
    formData,
    formRules,
    menuList,
    selectedMenu,
    filteredMenuList,
    parentMenuOptions,
    buttonPermissions,
    breadcrumbs,
    selectedPath,
    stats,
    treeActions,
    menuIconConfig,
    menuStatusConfigs: MENU_STATUS_CONFIGS,
    toolbarActions,
    expanded,
    isMock: isMockDataMode(),
    getMenuTypeText,
    getMenuTypeColor,
    getPermissionActions,
    selectMenu,
    handleNodeSelect,
    handleNodeAction,
    handleNodeDrop,
    toggleExpansion,
    handleAddMenu,
    handleAddPermission,
    handleEditMenu,
    handleEditPermission,
    handleDeleteMenu,
    handleSaveMenu,
    handleCancelModal,
    loadMenus,
    loadPermissions,
    syncNavigation,
  }
}
