<template>
  <NModal
    v-model:show="visible"
    style="width: 900px"
    :mask-closable="false"
    preset="dialog"
    :title="configTitle"
    positive-text="确定"
    negative-text="取消"
    :loading="configLoading"
    @positive-click="saveNodeConfig"
    @negative-click="handleCancel"
  >
    <!-- 公共选择面板 -->
    <template v-if="isUserSelectNode">
      <div class="max-h-60vh overflow-y-auto">
        <div class="config-section">
          <h4
            class="flex items-center gap-2 mb-4 text-base font-semibold"
            :style="{ color: 'var(--n-text-color-1)' }"
          >
            <div
              :class="userSelectConfig.icon"
              class="w-4 h-4"
            ></div>
            {{ userSelectConfig.title }}
          </h4>

          <NInput
            v-model:value="searchKeyword"
            placeholder="搜索用户姓名或部门"
            clearable
            class="mb-4"
          >
            <template #prefix>
              <div class="i-mdi:magnify w-4 h-4"></div>
            </template>
          </NInput>

          <div
            class="border rounded-lg p-3 mb-4 max-h-50 overflow-y-auto"
            :style="{
              borderColor: 'var(--n-border-color)',
              background: 'var(--n-color-embedded)',
            }"
          >
            <NTree
              :data="departmentUserTree"
              :checked-keys="userSelectConfig.checkedKeys"
              :selectable="false"
              checkable
              cascade
              :virtual-scroll="true"
              style="max-height: 300px"
              @update:checked-keys="userSelectConfig.onSelect"
            />
          </div>

          <div
            v-if="userSelectConfig.selectedUsers.length > 0"
            class="rounded-lg p-4 mb-4 border"
            :style="{
              borderColor: 'var(--n-border-color)',
              background: 'var(--n-color-embedded)',
            }"
          >
            <h5
              class="mb-2 text-sm font-medium"
              :style="{ color: 'var(--n-text-color-1)' }"
            >
              {{ userSelectConfig.selectedLabel }}
              ({{ userSelectConfig.selectedUsers.length }})
            </h5>
            <div class="flex flex-wrap gap-3">
              <NTag
                v-for="user in userSelectConfig.selectedUsers"
                :key="user.id"
                closable
                :type="userSelectConfig.tagType"
                @close="userSelectConfig.onRemove(user.id)"
              >
                <div class="flex items-center gap-2">
                  <NAvatar
                    :src="user.avatar"
                    :fallback-src="getDefaultAvatar(user.name)"
                    size="small"
                  />
                  <span class="font-medium text-sm">{{ user.name }}</span>
                  <span
                    class="text-xs px-1.5 py-0.5 rounded"
                    :style="{
                      color: 'var(--n-text-color-3)',
                      background: 'var(--n-color-embedded)',
                    }"
                    >{{ user.department }}</span
                  >
                </div>
              </NTag>
            </div>
          </div>
        </div>
        <!-- 审批节点时附带审批模式 -->
        <template v-if="props.currentNode?.type === 'approval'">
          <div class="mt-4">
            <h5
              class="mb-3 text-sm font-medium"
              :style="{ color: 'var(--n-text-color-1)' }"
              >审批模式</h5
            >
            <NRadioGroup v-model:value="approvalMode">
              <NSpace vertical>
                <NRadio
                  v-for="mode in APPROVAL_MODES"
                  :key="mode.value"
                  :value="mode.value"
                >
                  <div class="flex flex-col gap-1">
                    <strong class="text-sm">{{ mode.label }}</strong>
                    <span
                      class="text-xs"
                      :style="{ color: 'var(--n-text-color-3)' }"
                      >{{ mode.desc }}</span
                    >
                  </div>
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </div>
        </template>
      </div>
    </template>

    <!-- 条件节点配置 -->
    <div
      v-else-if="props.currentNode?.type === 'condition'"
      class="max-h-60vh overflow-y-auto"
    >
      <div class="config-section">
        <h4
          class="flex items-center gap-2 mb-4 text-base font-semibold"
          :style="{ color: 'var(--n-text-color-1)' }"
        >
          <div class="i-mdi:source-branch w-4 h-4"></div>
          条件分支设置
        </h4>
        <div class="space-y-3">
          <div
            v-for="(condition, index) in conditions"
            :key="condition.id"
            class="condition-item"
          >
            <NCard
              size="small"
              class="border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div class="flex items-center gap-3 flex-nowrap min-h-10 p-2">
                <NInput
                  v-model:value="condition.name"
                  placeholder="分支名称"
                  style="width: 150px"
                  class="flex-shrink-0"
                />
                <NSelect
                  v-model:value="condition.field"
                  placeholder="选择字段"
                  :options="FIELD_OPTIONS"
                  style="width: 120px"
                  class="flex-shrink-0"
                />
                <NSelect
                  v-model:value="condition.operator"
                  placeholder="操作符"
                  :options="OPERATOR_OPTIONS"
                  style="width: 100px"
                  class="flex-shrink-0"
                />
                <NInput
                  v-model:value="condition.value"
                  placeholder="值"
                  style="width: 120px"
                  class="flex-shrink-0"
                />
                <NButton
                  quaternary
                  type="error"
                  @click="removeCondition(index)"
                  class="flex-shrink-0 ml-auto"
                >
                  <template #icon>
                    <div class="i-mdi:delete w-4 h-4"></div>
                  </template>
                </NButton>
              </div>
            </NCard>
          </div>
          <NButton
            dashed
            block
            @click="addCondition"
            class="w-full"
          >
            <template #icon><div class="i-mdi:plus w-4 h-4"></div></template>
            添加条件
          </NButton>
        </div>
      </div>
    </div>
  </NModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type {
    WorkflowNode,
    User,
    Department,
    Condition,
  } from '@/types/work-flow'
  import {
    APPROVAL_MODES,
    FIELD_OPTIONS,
    OPERATOR_OPTIONS,
    CONFIG_TITLES,
    getDefaultAvatar,
    createDefaultCondition,
  } from './data'

  interface Props {
    show: boolean
    currentNode: WorkflowNode | null
    users: User[]
    departments: Department[]
  }
  const props = withDefaults(defineProps<Props>(), {
    show: false,
    currentNode: null,
    users: () => [],
    departments: () => [],
  })
  const emit = defineEmits(['update:show', 'save', 'cancel'])
  const message = useMessage()

  const searchKeyword = ref('')
  const selectedUsers = ref<string[]>([])
  const selectedCopyUsers = ref<string[]>([])
  const approvalMode = ref<'any' | 'all' | 'sequence'>('any')
  const configLoading = ref(false)
  const conditions = ref<Condition[]>([])

  const visible = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
  })
  const configTitle = computed(() => {
    if (props.currentNode?.type === 'start') return '发起人设置'
    const type = props.currentNode?.type as keyof typeof CONFIG_TITLES
    return CONFIG_TITLES[type] || '节点设置'
  })

  // 用户树
  const departmentUserTree = computed(() => {
    const tree: any[] = []
    const deptMap = new Map()
    props.departments?.forEach(dept => {
      if (!deptMap.has(dept.id)) {
        deptMap.set(dept.id, {
          key: `dept-${dept.id}`,
          label: `${dept.name} ${dept.manager ? `(负责人: ${dept.manager})` : ''}`,
          children: [],
          isLeaf: false,
          disabled: true,
        })
      }
    })
    const filteredUsers =
      props.users?.filter(
        user =>
          !searchKeyword.value ||
          user.name.includes(searchKeyword.value) ||
          user.department.includes(searchKeyword.value)
      ) || []

    filteredUsers.forEach(user => {
      const dept = props.departments?.find(d => d.name === user.department)
      if (dept && deptMap.has(dept.id)) {
        deptMap.get(dept.id).children.push({
          key: user.id,
          label: `${user.name}${user.role ? `(${user.role})` : ''}`,
          isLeaf: true,
          user,
        })
      }
    })

    deptMap.forEach(dept => {
      if (dept.children.length > 0) {
        tree.push(dept)
      }
    })

    return tree
  })

  const selectedApprovers = computed(
    () => props.users?.filter(u => selectedUsers.value.includes(u.id)) || []
  )
  const selectedCopyUserList = computed(
    () => props.users?.filter(u => selectedCopyUsers.value.includes(u.id)) || []
  )
  const selectedInitiators = computed(
    () => props.users?.filter(u => selectedUsers.value.includes(u.id)) || []
  )

  const handleUserSelect = (keys: string[]) => {
    selectedUsers.value = keys.filter(key => !key.startsWith('dept-'))
  }
  const handleCopyUserSelect = (keys: string[]) => {
    selectedCopyUsers.value = keys.filter(key => !key.startsWith('dept-'))
  }
  const removeApprover = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  }
  const removeCopyUser = (userId: string) => {
    selectedCopyUsers.value = selectedCopyUsers.value.filter(
      id => id !== userId
    )
  }
  const removeInitiator = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  }

  const addCondition = () => conditions.value.push(createDefaultCondition())
  const removeCondition = (index: number) => conditions.value.splice(index, 1)

  const configureStartNode = (node: WorkflowNode) => {
    const { initiators } = node.data as any
    selectedUsers.value = initiators ? initiators.map((u: User) => u.id) : []
  }
  const configureApprovalNode = (node: WorkflowNode) => {
    const approvers = (node.data as any).approvers || []
    selectedUsers.value = approvers.map((u: User) => u.id)
    approvalMode.value = (node.data as any).approvalMode || 'any'
  }
  const configureCopyNode = (node: WorkflowNode) => {
    const copyUsers = (node.data as any).copyUsers || []
    selectedCopyUsers.value = copyUsers.map((u: User) => u.id)
  }
  const configureConditionNode = (node: WorkflowNode) => {
    conditions.value = (node.data as any).conditions || []
  }

  const saveStartNodeConfig = async (): Promise<boolean> => {
    if (selectedUsers.value.length === 0) {
      message.error('请选择发起人')
      return false
    }
    const selectedUserObjs = selectedInitiators.value
    emit('save', { initiators: selectedUserObjs })
    message.success(`已设置 ${selectedUserObjs.length} 个发起人`)
    return true
  }
  const saveApprovalNodeConfig = async (): Promise<boolean> => {
    if (selectedUsers.value.length === 0) {
      message.error('请至少选择一个审批人')
      return false
    }
    const selectedUserObjs = selectedApprovers.value
    emit('save', {
      approvers: selectedUserObjs,
      approvalMode: approvalMode.value,
    })
    message.success(`已设置 ${selectedUserObjs.length} 个审批人`)
    return true
  }
  const saveCopyNodeConfig = async (): Promise<boolean> => {
    const selectedUserObjs = selectedCopyUserList.value
    emit('save', { copyUsers: selectedUserObjs })
    message.success(`已设置 ${selectedUserObjs.length} 个抄送人`)
    return true
  }
  const saveConditionNodeConfig = async (): Promise<boolean> => {
    if (conditions.value.length === 0) {
      message.error('请至少添加一个条件分支')
      return false
    }
    const validConditions = conditions.value.filter(
      c => c.name && c.field && c.operator && c.value
    )
    if (validConditions.length === 0) {
      message.error('请完善条件配置')
      return false
    }
    emit('save', { conditions: validConditions })
    message.success(`已设置 ${validConditions.length} 个条件分支`)
    return true
  }
  const saveNodeConfig = async (): Promise<boolean> => {
    if (!props.currentNode) return false
    configLoading.value = true
    try {
      const nodeSavers = {
        start: saveStartNodeConfig,
        approval: saveApprovalNodeConfig,
        copy: saveCopyNodeConfig,
        condition: saveConditionNodeConfig,
      }
      const saver =
        nodeSavers[props.currentNode.type as keyof typeof nodeSavers]
      const success = saver ? await saver() : false
      return success
    } catch (error) {
      message.error('保存配置失败')
      console.error('Save node config error:', error)
      return false
    } finally {
      configLoading.value = false
    }
  }
  const handleCancel = () => {
    emit('cancel')
  }
  watch(
    () => props.currentNode,
    newNode => {
      if (newNode) {
        searchKeyword.value = ''
        const nodeConfigurators = {
          start: configureStartNode,
          approval: configureApprovalNode,
          copy: configureCopyNode,
          condition: configureConditionNode,
        }
        const configurator =
          nodeConfigurators[newNode.type as keyof typeof nodeConfigurators]
        if (configurator) {
          configurator(newNode)
        }
      }
    },
    { immediate: true }
  )

  const isUserSelectNode = computed(() =>
    ['start', 'approval', 'copy'].includes(props.currentNode?.type || '')
  )

  const userSelectConfig = computed(() => {
    const type = props.currentNode?.type
    if (type === 'start') {
      return {
        icon: 'i-mdi:account-star',
        title: '选择发起人',
        checkedKeys: selectedUsers.value,
        onSelect: handleUserSelect,
        selectedUsers: selectedInitiators.value,
        selectedLabel: '已选择发起人',
        tagType: 'primary',
        onRemove: removeInitiator,
      }
    } else if (type === 'approval') {
      return {
        icon: 'i-mdi:account-check',
        title: '选择审批人',
        checkedKeys: selectedUsers.value,
        onSelect: handleUserSelect,
        selectedUsers: selectedApprovers.value,
        selectedLabel: '已选择审批人',
        tagType: 'info',
        onRemove: removeApprover,
      }
    } else if (type === 'copy') {
      return {
        icon: 'i-mdi:email-outline',
        title: '选择抄送人',
        checkedKeys: selectedCopyUsers.value,
        onSelect: handleCopyUserSelect,
        selectedUsers: selectedCopyUserList.value,
        selectedLabel: '已选择抄送人',
        tagType: 'success',
        onRemove: removeCopyUser,
      }
    }
    // 安全兜底
    return {
      icon: '',
      title: '',
      checkedKeys: [],
      onSelect: () => {},
      selectedUsers: [],
      selectedLabel: '',
      tagType: 'default',
      onRemove: () => {},
    }
  })
</script>
