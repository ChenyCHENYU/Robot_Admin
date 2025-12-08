<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-10 14:20:39
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 15:07:57
 * @FilePath: \Robot_Admin\src\components\local\c_role\index.vue
 * @Description: 角色权限设置组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <NDrawer
    v-model:show="showDrawer"
    :width="1200"
    placement="right"
    :mask-closable="false"
  >
    <NDrawerContent closable>
      <template #header>
        <div class="permission-header">
          <div class="header-info">
            <C_Icon
              name="mdi:shield-key-outline"
              :size="24"
            />
            <div>
              <h3>权限分配</h3>
              <p
                >{{ role?.name }} - {{ role?.description || '角色权限管理' }}</p
              >
            </div>
          </div>
          <div class="header-actions">
            <NSpace>
              <NBadge
                :value="selectedIds.length"
                :max="999"
                type="success"
              >
                <NButton
                  type="primary"
                  size="large"
                  @click="handleSave"
                >
                  <template #icon>
                    <C_Icon
                      name="mdi:content-save"
                      :size="16"
                    />
                  </template>
                  保存配置 ({{ selectedIds.length }})
                </NButton>
              </NBadge>
              <NButton @click="handleCancel">取消</NButton>
            </NSpace>
          </div>
        </div>
      </template>

      <div class="tree-permission-layout">
        <!-- 顶部工具栏 -->
        <div class="permission-toolbar">
          <div class="toolbar-left">
            <NInput
              v-model:value="searchKeyword"
              placeholder="搜索权限名称、编码或描述..."
              clearable
              size="large"
              style="width: 350px"
            >
              <template #prefix>
                <C_Icon
                  name="mdi:magnify"
                  :size="18"
                />
              </template>
            </NInput>

            <NSelect
              v-model:value="permissionTypeFilter"
              placeholder="权限类型"
              clearable
              style="width: 120px"
              :options="PERMISSION_CONFIG.permissionTypeOptions"
            />

            <NCheckbox
              :checked="expandAll"
              @update:checked="handleToggleExpandAll"
            >
              {{ expandAll ? '收起全部' : '展开全部' }}
            </NCheckbox>
          </div>

          <div class="toolbar-right">
            <NSpace>
              <NButtonGroup>
                <NButton
                  @click="handleSelectAll"
                  type="primary"
                  ghost
                >
                  <template #icon>
                    <C_Icon
                      name="mdi:checkbox-multiple-marked"
                      :size="16"
                    />
                  </template>
                  全选
                </NButton>
                <NButton @click="handleClearAll">
                  <template #icon>
                    <C_Icon
                      name="mdi:checkbox-multiple-blank"
                      :size="16"
                    />
                  </template>
                  清空
                </NButton>
              </NButtonGroup>

              <NButton
                type="primary"
                ghost
                @click="$emit('showTemplate')"
              >
                <template #icon>
                  <C_Icon
                    name="mdi:bookmark-multiple"
                    :size="16"
                  />
                </template>
                快速模板
              </NButton>
            </NSpace>
          </div>
        </div>

        <!-- 统计信息栏 -->
        <div class="permission-stats">
          <NSpace align="center">
            <div class="stat-item">
              <span class="stat-label">全部权限:</span>
              <span class="stat-value">{{ totalCount }}</span>
            </div>
            <NDivider vertical />
            <div class="stat-item">
              <span class="stat-label">已选权限:</span>
              <span class="stat-value highlight">{{ selectedIds.length }}</span>
            </div>
            <NDivider vertical />
            <div class="stat-item">
              <span class="stat-label">覆盖模块:</span>
              <span class="stat-value">{{ selectedModulesCount }}</span>
            </div>
            <NDivider vertical />
            <template
              v-for="[type, label] in typeStatOptions"
              :key="type"
            >
              <div class="stat-item">
                <span class="stat-label">{{ label }}权限:</span>
                <span class="stat-value">{{ typeStatistics[type] }}</span>
              </div>
            </template>
          </NSpace>
        </div>

        <!-- 权限树容器 -->
        <div class="tree-permissions-container">
          <div
            v-for="module in filteredModules"
            :key="module.id"
            class="permission-module"
          >
            <!-- 模块头部 -->
            <div class="module-header">
              <div class="module-info">
                <div class="module-title-section">
                  <NButton
                    text
                    @click="() => toggleExpand(module.id, moduleExpandState)"
                    class="expand-button"
                  >
                    <template #icon>
                      <C_Icon
                        :name="
                          moduleExpandState[module.id]
                            ? 'mdi:chevron-down'
                            : 'mdi:chevron-right'
                        "
                        :size="18"
                      />
                    </template>
                  </NButton>
                  <C_Icon
                    :name="module.icon || 'mdi:folder'"
                    :size="20"
                  />
                  <h4>{{ module.name }}</h4>
                  <NTag
                    size="small"
                    type="info"
                  >
                    {{ getModulePermissionCount(module) }} 权限
                  </NTag>
                </div>
                <p class="module-description">
                  {{ module.description || '该模块的功能权限配置' }}
                </p>
              </div>

              <div class="module-controls">
                <div class="module-progress">
                  <span class="progress-text">
                    {{ getModuleSelectedCount(module) }}/{{
                      getModulePermissionCount(module)
                    }}
                  </span>
                  <NProgress
                    type="line"
                    :percentage="getModuleSelectionPercentage(module)"
                    :height="6"
                    :border-radius="3"
                    :show-indicator="false"
                    :color="getModuleProgressColor(module)"
                  />
                </div>
                <NCheckbox
                  :checked="isModuleFullySelected(module)"
                  :indeterminate="isModulePartiallySelected(module)"
                  @update:checked="
                    (checked: boolean) => handleToggleModule(module, checked)
                  "
                  size="large"
                >
                  全选模块
                </NCheckbox>
              </div>
            </div>

            <!-- 权限列表 -->
            <div
              v-if="moduleExpandState[module.id]"
              class="permission-content"
            >
              <div
                v-for="permission in getModuleDisplayPermissions(module)"
                :key="permission.id"
                class="permission-tree-node"
              >
                <!-- 权限卡片 -->
                <div
                  class="permission-card"
                  :class="{
                    selected: isPermissionSelected(permission.id),
                    highlighted: isSearchMatch(permission),
                    'has-children': hasValidChildren(permission),
                  }"
                  @click="
                    () =>
                      handleTogglePermission(
                        permission.id,
                        !isPermissionSelected(permission.id)
                      )
                  "
                >
                  <div class="permission-header">
                    <div class="permission-main">
                      <NCheckbox
                        :checked="isPermissionSelected(permission.id)"
                        :indeterminate="
                          isPermissionPartiallySelected(permission)
                        "
                        @update:checked="
                          (checked: boolean) =>
                            handleToggleMenuPermission(permission, checked)
                        "
                        @click.stop
                        size="large"
                      />
                      <div class="permission-info">
                        <div class="permission-title">
                          <C_Icon
                            :name="getPermissionIcon(permission.type)"
                            :size="16"
                          />
                          <span class="permission-name">{{
                            permission.name
                          }}</span>
                          <NTag
                            size="tiny"
                            :type="getPermissionTypeColor(permission.type)"
                          >
                            {{ getPermissionTypeName(permission.type) }}
                          </NTag>
                          <NTag
                            v-if="hasValidChildren(permission)"
                            size="tiny"
                            type="info"
                          >
                            {{ getFilteredChildPermissions(permission).length }}
                            个子权限
                          </NTag>
                        </div>
                        <div class="permission-details">
                          <code class="permission-code">{{
                            permission.code
                          }}</code>
                          <span
                            v-if="permission.description"
                            class="permission-description"
                          >
                            {{ permission.description }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 展开按钮 -->
                    <NButton
                      v-if="hasValidChildren(permission)"
                      text
                      size="small"
                      @click.stop="
                        () => toggleExpand(permission.id, permissionExpandState)
                      "
                    >
                      <template #icon>
                        <C_Icon
                          :name="
                            permissionExpandState[permission.id]
                              ? 'mdi:chevron-down'
                              : 'mdi:chevron-right'
                          "
                          :size="16"
                        />
                      </template>
                    </NButton>
                  </div>

                  <!-- 选中指示器 -->
                  <div
                    v-if="isPermissionSelected(permission.id)"
                    class="selection-indicator"
                  >
                    <C_Icon
                      name="mdi:check-circle"
                      :size="18"
                    />
                  </div>
                </div>

                <!-- 子权限列表 -->
                <div
                  v-if="
                    hasValidChildren(permission) &&
                    permissionExpandState[permission.id]
                  "
                  class="child-permissions"
                >
                  <div class="child-permissions-grid">
                    <div
                      v-for="childPermission in getFilteredChildPermissions(
                        permission
                      )"
                      :key="childPermission.id"
                      class="child-permission-card"
                      :class="{
                        selected: isPermissionSelected(childPermission.id),
                        highlighted: isSearchMatch(childPermission),
                        'button-type': childPermission.type === 'button',
                        'api-type': childPermission.type === 'api',
                      }"
                      @click="
                        () =>
                          handleTogglePermission(
                            childPermission.id,
                            !isPermissionSelected(childPermission.id)
                          )
                      "
                    >
                      <div class="child-permission-content">
                        <NCheckbox
                          :checked="isPermissionSelected(childPermission.id)"
                          @update:checked="
                            (checked: boolean) =>
                              handleTogglePermission(
                                childPermission.id,
                                checked
                              )
                          "
                          @click.stop
                          size="medium"
                        />
                        <div class="child-permission-info">
                          <div class="child-permission-title">
                            <C_Icon
                              :name="getPermissionIcon(childPermission.type)"
                              :size="14"
                            />
                            <span class="child-permission-name">{{
                              childPermission.name
                            }}</span>
                            <NTag
                              size="tiny"
                              :type="
                                getPermissionTypeColor(childPermission.type)
                              "
                            >
                              {{ getPermissionTypeName(childPermission.type) }}
                            </NTag>
                          </div>
                          <div class="child-permission-details">
                            <code class="child-permission-code">{{
                              childPermission.code
                            }}</code>
                            <span
                              v-if="childPermission.description"
                              class="child-permission-description"
                            >
                              {{ childPermission.description }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- 子权限选中指示器 -->
                      <div
                        v-if="isPermissionSelected(childPermission.id)"
                        class="child-selection-indicator"
                      >
                        <C_Icon
                          name="mdi:check"
                          :size="14"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部预览 -->
        <div
          v-if="selectedIds.length > 0"
          class="selected-preview"
        >
          <div class="preview-header">
            <h5>已选择的权限</h5>
            <NButton
              text
              type="error"
              @click="handleClearAll"
              size="small"
            >
              <template #icon>
                <C_Icon
                  name="mdi:delete-sweep"
                  :size="16"
                />
              </template>
              清空全部
            </NButton>
          </div>

          <div class="preview-summary">
            <NSpace>
              <NTag
                v-for="group in selectedPermissionGroups.slice(0, 6)"
                :key="group.module"
                type="primary"
                size="medium"
              >
                {{ group.module }} ({{ group.permissions.length }})
              </NTag>
              <NTag
                v-if="selectedPermissionGroups.length > 6"
                type="default"
                size="medium"
              >
                +{{ selectedPermissionGroups.length - 6 }} 更多模块
              </NTag>
            </NSpace>
          </div>
        </div>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
  import {
    type PermissionData,
    type RoleData,
    PERMISSION_CONFIG,
    usePermissionUtils,
  } from './data'

  // 类型定义
  interface Props {
    show: boolean
    role: RoleData | null
    permissions: PermissionData[]
    selectedIds: string[]
  }

  interface Emits {
    (e: 'update:show', value: boolean): void
    (e: 'update:selectedIds', value: string[]): void
    (e: 'save', selectedIds: string[]): void
    (e: 'showTemplate'): void
  }

  interface PermissionGroup {
    module: string
    icon: string
    permissions: PermissionData[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 工具函数解构
  const {
    findPermissionById,
    findTopLevelPermission,
    getAllPermissionIds,
    hasMatchingPermissionInTree,
    hasPermissionTypeInTree,
    getModulePermissions,
    getModuleDisplayPermissions,
    getPermissionIcon,
    getPermissionTypeColor,
    getPermissionTypeName,
  } = usePermissionUtils()

  // 响应式状态
  const searchKeyword = ref<string>('')
  const permissionTypeFilter = ref<string | null>(null)
  const expandAll = ref<boolean>(false)
  const moduleExpandState = reactive<Record<string, boolean>>({})
  const permissionExpandState = reactive<Record<string, boolean>>({})

  // 常量定义
  const typeStatOptions = [
    ['menu', '菜单'],
    ['button', '按钮'],
    ['api', '接口'],
  ] as const

  // 核心计算属性
  const showDrawer = computed<boolean>({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
  })

  const selectedIds = computed<string[]>({
    get: () => props.selectedIds,
    set: (value: string[]) => emit('update:selectedIds', value),
  })

  // 过滤模块
  const filteredModules = computed<PermissionData[]>(() => {
    const { permissions } = props
    const keyword = searchKeyword.value?.toLowerCase()
    const typeFilter = permissionTypeFilter.value

    if (!keyword && !typeFilter) return permissions

    return permissions.filter(module => {
      const { name, code, children = [] } = module

      // 搜索过滤
      if (keyword) {
        const moduleMatches = [name, code].some(field =>
          field.toLowerCase().includes(keyword)
        )
        if (!moduleMatches && !hasMatchingPermissionInTree(children, keyword))
          return false
      }

      // 类型过滤
      if (typeFilter && !hasPermissionTypeInTree(children, typeFilter))
        return false

      return true
    })
  })

  // 统计数据
  const totalCount = computed<number>(
    () => getAllPermissionIds(props.permissions).length
  )

  const selectedModulesCount = computed<number>(() => {
    const moduleIds = new Set<string>()
    selectedIds.value.forEach(id => {
      const topLevel = findTopLevelPermission(props.permissions, id)
      if (topLevel) moduleIds.add(topLevel.id)
    })
    return moduleIds.size
  })

  const typeStatistics = computed(() => {
    const stats = { menu: 0, button: 0, api: 0 }
    selectedIds.value.forEach(id => {
      const permission = findPermissionById(props.permissions, id)
      if (permission?.type && permission.type in stats) {
        stats[permission.type as keyof typeof stats]++
      }
    })
    return stats
  })

  // 权限组数据
  const selectedPermissionGroups = computed<PermissionGroup[]>(() => {
    const groups: Record<string, PermissionGroup> = {}

    selectedIds.value.forEach(id => {
      const permission = findPermissionById(props.permissions, id)
      const topLevel = findTopLevelPermission(props.permissions, id)

      if (permission && topLevel) {
        const { name, icon = 'mdi:folder' } = topLevel
        groups[name] ??= { module: name, icon, permissions: [] }
        groups[name].permissions.push(permission)
      }
    })

    return Object.values(groups)
  })

  // 工具方法 - 简化版本
  const isPermissionSelected = (permissionId: string): boolean =>
    selectedIds.value.includes(permissionId)

  const isSearchMatch = (permission: PermissionData): boolean => {
    if (!searchKeyword.value) return false
    const keyword = searchKeyword.value.toLowerCase()
    return [
      permission.name,
      permission.code,
      permission.description || '',
    ].some(field => field.toLowerCase().includes(keyword))
  }

  const hasValidChildren = (permission: PermissionData): boolean =>
    getFilteredChildPermissions(permission).length > 0

  const getFilteredChildPermissions = (
    permission: PermissionData
  ): PermissionData[] => {
    const { children = [] } = permission
    const keyword = searchKeyword.value?.toLowerCase()
    const typeFilter = permissionTypeFilter.value

    return children.filter(child => {
      if (typeFilter && child.type !== typeFilter) return false
      if (keyword) {
        return [child.name, child.code, child.description || ''].some(field =>
          field.toLowerCase().includes(keyword)
        )
      }
      return true
    })
  }

  const isPermissionPartiallySelected = (
    permission: PermissionData
  ): boolean => {
    const { children = [] } = permission
    const childIds = children.map(child => child.id)
    const selectedChildIds = childIds.filter(id =>
      selectedIds.value.includes(id)
    )
    return (
      selectedChildIds.length > 0 && selectedChildIds.length < childIds.length
    )
  }

  // 模块相关方法
  const getModulePermissionCount = (module: PermissionData): number =>
    getModulePermissions(module).length

  const getModuleSelectedCount = (module: PermissionData): number =>
    getModulePermissions(module).filter(p => selectedIds.value.includes(p.id))
      .length

  const getModuleSelectionPercentage = (module: PermissionData): number => {
    const total = getModulePermissionCount(module)
    const selected = getModuleSelectedCount(module)
    return total > 0 ? Math.round((selected / total) * 100) : 0
  }

  const getModuleProgressColor = (module: PermissionData): string => {
    const percentage = getModuleSelectionPercentage(module)
    return percentage === 0
      ? '#d9d9d9'
      : percentage === 100
        ? '#52c41a'
        : '#1890ff'
  }

  const isModuleFullySelected = (module: PermissionData): boolean => {
    const modulePermissions = getModulePermissions(module)
    return (
      modulePermissions.length > 0 &&
      modulePermissions.every(p => selectedIds.value.includes(p.id))
    )
  }

  const isModulePartiallySelected = (module: PermissionData): boolean => {
    const modulePermissions = getModulePermissions(module)
    const selectedCount = modulePermissions.filter(p =>
      selectedIds.value.includes(p.id)
    ).length
    return selectedCount > 0 && selectedCount < modulePermissions.length
  }

  // 事件处理 - 简化版本
  const toggleExpand = (id: string, state: Record<string, boolean>): void => {
    state[id] = !state[id]
  }

  const handleToggleExpandAll = (expanded: boolean): void => {
    expandAll.value = expanded
    props.permissions.forEach(({ id, children = [] }) => {
      moduleExpandState[id] = expanded
      children.forEach(permission => {
        if (permission.children?.length) {
          permissionExpandState[permission.id] = expanded
        }
      })
    })
  }

  const updateSelectedIds = (updater: (ids: Set<string>) => void): void => {
    const currentIds = new Set(selectedIds.value)
    updater(currentIds)
    selectedIds.value = Array.from(currentIds)
  }

  const handleTogglePermission = (
    permissionId: string,
    checked: boolean
  ): void => {
    updateSelectedIds(ids =>
      checked ? ids.add(permissionId) : ids.delete(permissionId)
    )
  }

  const handleToggleMenuPermission = (
    permission: PermissionData,
    checked: boolean
  ): void => {
    const { id, children = [] } = permission
    updateSelectedIds(ids => {
      if (checked) {
        ids.add(id)
        children.forEach(child => ids.add(child.id))
      } else {
        ids.delete(id)
        children.forEach(child => ids.delete(child.id))
      }
    })
  }

  const handleToggleModule = (
    module: PermissionData,
    checked: boolean
  ): void => {
    const modulePermissions = getModulePermissions(module)
    updateSelectedIds(ids => {
      modulePermissions.forEach(p =>
        checked ? ids.add(p.id) : ids.delete(p.id)
      )
    })
  }

  const handleSelectAll = (): void => {
    selectedIds.value = getAllPermissionIds(props.permissions)
  }

  const handleClearAll = (): void => {
    selectedIds.value = []
  }

  const handleSave = (): void => {
    emit('save', selectedIds.value)
  }

  const handleCancel = (): void => {
    showDrawer.value = false
  }

  // 初始化展开状态
  watch(
    () => props.show,
    (show: boolean) => {
      if (show && props.permissions.length > 0) {
        props.permissions.forEach(({ id }) => {
          moduleExpandState[id] ??= true
        })
      }
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
