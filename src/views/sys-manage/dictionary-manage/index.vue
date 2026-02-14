<template>
  <div class="dictionary-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NInput
          v-model:value="searchPattern"
          placeholder="搜索字典名称"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <C_Icon
              name="mdi:magnify"
              :size="16"
            />
          </template>
        </NInput>

        <C_ActionBar
          :actions="toolbarActions"
          :config="{ compact: true }"
        />
      </NSpace>
    </NCard>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <NGrid
        :cols="24"
        :x-gap="16"
        responsive="screen"
      >
        <!-- 左侧字典树 -->
        <NGi
          :span="8"
          :md="12"
          :sm="24"
        >
          <NCard
            title="数据字典"
            class="content-card"
          >
            <C_Tree
              ref="treeRef"
              mode="custom"
              :data="filteredDictList"
              :search-pattern="searchPattern"
              :searchable="false"
              :show-toolbar="false"
              :status-configs="dictStatusConfigs"
              :icon-config="dictIconConfig"
              :actions="dictActions as any"
              :default-expanded-keys="expandedKeys"
              :default-selected-keys="selectedKeys"
              @node-select="handleNodeSelect"
              @node-action="handleNodeAction"
              @add="handleAddFromTree"
              class="dict-tree"
            />
          </NCard>
        </NGi>

        <!-- 右侧详情面板 -->
        <NGi
          :span="16"
          :md="12"
          :sm="24"
        >
          <NCard class="content-card">
            <template #header>
              <NSpace
                justify="space-between"
                align="center"
              >
                <NSpace align="center">
                  <NText
                    :class="{
                      'disabled-text':
                        selectedDict && selectedDict.status === 0,
                    }"
                  >
                    {{
                      selectedDict
                        ? `${getDictTypeText(selectedDict.type)} - ${selectedDict.name}`
                        : '选择字典查看详情'
                    }}
                  </NText>
                  <NTag
                    v-if="selectedDict && selectedDict.status === 0"
                    type="error"
                    size="small"
                  >
                    <template #icon>
                      <C_Icon
                        name="mdi:pause-circle"
                        :size="10"
                      />
                    </template>
                    已禁用
                  </NTag>
                </NSpace>
                <C_ActionBar
                  v-if="selectedDict"
                  :actions="getDetailActions(selectedDict)"
                  :config="{ compact: true, size: 'small' }"
                />
              </NSpace>
            </template>

            <!-- 未选择状态 -->
            <NEmpty
              v-if="!selectedDict"
              description="请从左侧选择一个字典项查看详细信息"
              class="mt-80px"
            >
              <template #icon>
                <C_Icon
                  name="mdi:book-open-variant"
                  :size="72"
                  class="mt--80px"
                />
              </template>
            </NEmpty>

            <!-- 选中字典详情 -->
            <NSpace
              v-else
              vertical
              :size="24"
            >
              <!-- 基本信息 -->
              <NCard
                title="基本信息"
                size="small"
              >
                <NGrid
                  :cols="2"
                  :x-gap="16"
                  :y-gap="12"
                >
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">名称：</NText>
                      <NText
                        :class="{ 'disabled-text': selectedDict.status === 0 }"
                      >
                        {{ selectedDict.name }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">类型：</NText>
                      <NTag
                        :type="getDictTypeConfig(selectedDict.type).color"
                        size="small"
                        :class="{ 'disabled-tag': selectedDict.status === 0 }"
                      >
                        <template #icon>
                          <C_Icon
                            :name="getDictTypeConfig(selectedDict.type).icon"
                            :size="12"
                            :color="
                              selectedDict.status === 0
                                ? '#d9d9d9'
                                : getDictTypeIconColor(selectedDict.type)
                            "
                          />
                        </template>
                        {{ getDictTypeText(selectedDict.type) }}
                      </NTag>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">编码：</NText>
                      <NTag
                        type="info"
                        size="small"
                        :class="{ 'disabled-tag': selectedDict.status === 0 }"
                      >
                        {{ selectedDict.code }}
                      </NTag>
                    </NSpace>
                  </NGi>
                  <NGi v-if="selectedDict.value">
                    <NSpace align="center">
                      <NText depth="3">字典值：</NText>
                      <NTag
                        type="success"
                        size="small"
                        :class="{ 'disabled-tag': selectedDict.status === 0 }"
                      >
                        {{ selectedDict.value }}
                      </NTag>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">排序：</NText>
                      <NText
                        :class="{ 'disabled-text': selectedDict.status === 0 }"
                      >
                        {{ selectedDict.sort }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">状态：</NText>
                      <NTag
                        :type="selectedDict.status === 1 ? 'success' : 'error'"
                        size="small"
                      >
                        <template #icon>
                          <C_Icon
                            :name="
                              selectedDict.status === 1
                                ? 'mdi:check-circle'
                                : 'mdi:pause-circle'
                            "
                            :size="10"
                          />
                        </template>
                        {{ selectedDict.status === 1 ? '启用' : '禁用' }}
                      </NTag>
                    </NSpace>
                  </NGi>
                </NGrid>
              </NCard>

              <!-- 字典项列表 -->
              <NCard
                v-if="selectedDict.type === 'type' && dictItems.length > 0"
                size="small"
              >
                <template #header>
                  <NSpace
                    justify="space-between"
                    align="center"
                  >
                    <NText>字典项</NText>
                    <C_ActionBar
                      v-if="selectedDict.status === 1"
                      :actions="[
                        {
                          key: 'add',
                          label: '添加字典项',
                          icon: 'mdi:plus',
                          type: 'primary',
                          onClick: handleAddDictItem,
                        },
                      ]"
                      :config="{ compact: true, size: 'small' }"
                    />
                  </NSpace>
                </template>

                <NSpace
                  vertical
                  :size="12"
                >
                  <NCard
                    v-for="item in dictItems"
                    :key="item.id"
                    size="small"
                    hoverable
                    :class="{ 'disabled-item': item.status === 0 }"
                  >
                    <NSpace
                      justify="space-between"
                      align="center"
                    >
                      <NSpace
                        vertical
                        :size="6"
                      >
                        <NSpace align="center">
                          <C_Icon
                            name="mdi:tag"
                            :size="16"
                            :color="
                              item.status === 0
                                ? '#d9d9d9'
                                : getDictTypeIconColor('item')
                            "
                          />
                          <NText
                            strong
                            :class="{ 'disabled-text': item.status === 0 }"
                          >
                            {{ item.name }}
                          </NText>
                          <NTag
                            :type="item.status === 1 ? 'success' : 'error'"
                            size="tiny"
                          >
                            <template #icon>
                              <C_Icon
                                :name="
                                  item.status === 1
                                    ? 'mdi:check-circle'
                                    : 'mdi:pause-circle'
                                "
                                :size="10"
                              />
                            </template>
                            {{ item.status === 1 ? '启用' : '禁用' }}
                          </NTag>
                        </NSpace>
                        <NSpace align="center">
                          <NText depth="3">值:</NText>
                          <NTag
                            size="small"
                            type="info"
                            :class="{ 'disabled-tag': item.status === 0 }"
                          >
                            {{ item.value }}
                          </NTag>
                          <NText depth="3">编码:</NText>
                          <NTag
                            size="small"
                            type="default"
                            :class="{ 'disabled-tag': item.status === 0 }"
                          >
                            {{ item.code }}
                          </NTag>
                        </NSpace>
                      </NSpace>

                      <C_ActionBar
                        :actions="getItemActions(item)"
                        :config="{ compact: true, size: 'tiny' }"
                      />
                    </NSpace>
                  </NCard>
                </NSpace>
              </NCard>

              <!-- 统计信息 -->
              <NCard
                v-if="selectedDict.type === 'type' && dictStats"
                title="统计信息"
                size="small"
              >
                <NGrid
                  :cols="3"
                  :x-gap="16"
                >
                  <NGi>
                    <NStatistic label="字典项总数">
                      <template #default>
                        <NText
                          style="
                            font-size: 28px;
                            font-weight: bold;
                            color: #52c41a;
                          "
                        >
                          {{ dictStats.total }}
                        </NText>
                      </template>
                    </NStatistic>
                  </NGi>
                  <NGi>
                    <NStatistic label="启用">
                      <template #default>
                        <NText
                          style="
                            font-size: 28px;
                            font-weight: bold;
                            color: #52c41a;
                          "
                        >
                          {{ dictStats.enabled }}
                        </NText>
                      </template>
                    </NStatistic>
                  </NGi>
                  <NGi>
                    <NStatistic label="禁用">
                      <template #default>
                        <NText
                          style="
                            font-size: 28px;
                            font-weight: bold;
                            color: #ff4d4f;
                          "
                        >
                          {{ dictStats.disabled }}
                        </NText>
                      </template>
                    </NStatistic>
                  </NGi>
                </NGrid>
              </NCard>

              <!-- 备注信息 -->
              <NCard
                v-if="selectedDict.remark"
                title="备注信息"
                size="small"
              >
                <NText>{{ selectedDict.remark }}</NText>
              </NCard>
            </NSpace>
          </NCard>
        </NGi>
      </NGrid>
    </div>

    <!-- 添加/编辑字典弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSaveDict"
      @negative-click="handleCancelModal"
      style="width: 600px"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <NFormItem
          label="类型"
          path="type"
        >
          <NRadioGroup v-model:value="formData.type">
            <NRadio value="type">
              <NSpace align="center">
                <C_Icon
                  name="mdi:folder-table"
                  :size="16"
                  color="#1890ff"
                  class="vertical-middle"
                />
                <NText>字典类型</NText>
              </NSpace>
            </NRadio>
            <NRadio value="item">
              <NSpace align="center">
                <C_Icon
                  name="mdi:tag"
                  :size="16"
                  color="#52c41a"
                  class="vertical-middle"
                />
                <NText>字典项</NText>
              </NSpace>
            </NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem
          label="名称"
          path="name"
        >
          <NInput
            v-model:value="formData.name"
            placeholder="请输入名称"
          />
        </NFormItem>

        <NFormItem
          v-if="formData.type === 'item'"
          label="所属字典类型"
          path="parentId"
        >
          <NSelect
            v-model:value="formData.parentId"
            :options="dictTypeOptions"
            placeholder="请选择字典类型"
            clearable
          />
        </NFormItem>

        <NFormItem
          v-if="formData.type === 'type'"
          label="类型编码"
          path="typeCode"
        >
          <NInput
            v-model:value="formData.typeCode"
            placeholder="请输入类型编码，如：user_status"
          />
        </NFormItem>

        <NFormItem
          v-if="formData.type === 'item'"
          label="字典标签"
          path="dictLabel"
        >
          <NInput
            v-model:value="formData.dictLabel"
            placeholder="请输入字典标签"
          />
        </NFormItem>

        <NFormItem
          v-if="formData.type === 'item'"
          label="字典值"
          path="dictValue"
        >
          <NInput
            v-model:value="formData.dictValue"
            placeholder="请输入字典值"
          />
        </NFormItem>

        <NFormItem
          label="排序号"
          path="sort"
        >
          <NInputNumber
            v-model:value="formData.sort"
            placeholder="排序号"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem
          label="状态"
          path="status"
        >
          <NSwitch
            v-model:value="formData.status"
            :checked-value="1"
            :unchecked-value="0"
          >
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>

        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst } from 'naive-ui/es'
  import type { ActionItem } from '@/types/modules/action-bar'
  import C_Tree from '@/components/global/C_Tree/index.vue'
  import {
    type DictData,
    type DictFormData,
    type TreeNodeData,
    DICT_FORM_RULES,
    DICT_STATUS_CONFIGS,
    DEFAULT_DICT_FORM_DATA,
    getDictListApi,
    addDictApi,
    updateDictApi,
    deleteDictApi,
    toggleDictStatusApi,
  } from './data'

  const message = useMessage()

  // 响应式数据
  const loading = ref(false)
  const searchPattern = ref('')
  const showModal = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const treeRef = ref<InstanceType<typeof C_Tree> | null>(null)
  const expandedKeys = ref<string[]>([])
  const selectedKeys = ref<string[]>([])
  const isAllExpanded = ref(false)

  // 使用 reactive 确保数据的响应式更新
  const dictList = reactive<DictData[]>([])

  // 表单数据
  const formData = reactive<DictFormData>({ ...DEFAULT_DICT_FORM_DATA })
  const formRules = DICT_FORM_RULES

  // 计算属性
  const modalTitle = computed(() =>
    modalMode.value === 'add'
      ? `新增${formData.type === 'type' ? '字典类型' : '字典项'}`
      : `编辑${formData.type === 'type' ? '字典类型' : '字典项'}`
  )

  const dictStatusConfigs = computed(() => DICT_STATUS_CONFIGS)

  const dictIconConfig = computed(() => ({
    typeMap: { type: 'mdi:folder-table', item: 'mdi:tag' },
    colorMap: { type: '#1890ff', item: '#52c41a' },
  }))

  const dictActions = computed(() => [
    {
      key: 'add',
      text: '新增字典项',
      icon: 'mdi:plus',
      type: 'primary',
      show: (node: TreeNodeData) => {
        const dictNode = node as DictData
        return dictNode.type === 'type' && dictNode.status === 1
      },
    },
    {
      key: 'edit',
      text: '编辑',
      icon: 'mdi:pencil',
      type: 'info',
    },
    {
      key: 'toggle',
      text: '切换状态',
      icon: 'mdi:toggle-switch',
      type: 'warning',
    },
    {
      key: 'delete',
      text: '删除',
      icon: 'mdi:delete',
      type: 'error',
      confirm: '确认删除该字典吗？',
    },
  ])

  const selectedDict = computed(() => {
    if (!selectedKeys.value.length) return null
    return findDictById(dictList, selectedKeys.value[0])
  })

  const dictItems = computed(() => selectedDict.value?.children || [])

  const dictStats = computed(() => {
    if (!selectedDict.value || selectedDict.value.type !== 'type') return null
    const items = dictItems.value
    return {
      total: items.length,
      enabled: items.filter(item => item.status === 1).length,
      disabled: items.filter(item => item.status === 0).length,
    }
  })

  const dictTypeOptions = computed(() =>
    dictList
      .filter(dict => dict.type === 'type')
      .map(dict => ({ label: dict.name, value: dict.id }))
  )

  const filteredDictList = computed(() => {
    if (!searchPattern.value.trim()) return dictList

    const filterDict = (dict: DictData): DictData | null => {
      const matchesKeyword = dict.name
        .toLowerCase()
        .includes(searchPattern.value.toLowerCase())
      const filteredChildren =
        (dict.children?.map(filterDict).filter(Boolean) as DictData[]) || []

      if (matchesKeyword || filteredChildren.length > 0) {
        return { ...dict, children: filteredChildren }
      }
      return null
    }

    return dictList.map(filterDict).filter(Boolean) as DictData[]
  })

  // 工具栏按钮配置
  const toolbarActions = computed<ActionItem[]>(() => [
    {
      key: 'add',
      label: '新增字典类型',
      icon: 'mdi:plus',
      type: 'primary',
      onClick: () => handleAddDict(),
    },
    {
      key: 'expand',
      label: isAllExpanded.value ? '收起全部' : '展开全部',
      icon: 'mdi:file-tree',
      onClick: expandAll,
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: 'mdi:refresh',
      onClick: refreshDicts,
    },
  ])

  // 字典项操作按钮配置
  const getItemActions = (item: DictData): ActionItem[] => [
    {
      key: 'edit',
      icon: 'mdi:pencil',
      tooltip: '编辑',
      onClick: () => handleEditDict(item),
    },
    {
      key: 'toggle',
      icon: item.status === 1 ? 'mdi:pause' : 'mdi:play',
      type: item.status === 1 ? 'warning' : 'success',
      tooltip: item.status === 1 ? '禁用' : '启用',
      onClick: () => handleToggleStatus(item),
    },
    {
      key: 'delete',
      icon: 'mdi:delete',
      type: 'error',
      tooltip: '删除',
      popconfirm: '确认删除该字典项吗？',
      onClick: () => handleDeleteDict(item.id),
    },
  ]

  // 详情卡片头部操作按钮配置
  const getDetailActions = (dict: DictData): ActionItem[] => [
    {
      key: 'edit',
      label: '编辑',
      icon: 'mdi:pencil',
      onClick: () => handleEditDict(dict),
    },
    {
      key: 'toggle',
      label: dict.status === 1 ? '禁用' : '启用',
      icon: dict.status === 1 ? 'mdi:pause' : 'mdi:play',
      type: dict.status === 1 ? 'warning' : 'success',
      onClick: () => handleToggleStatus(dict),
    },
  ]

  // 工具函数
  const getDictTypeText = (type: 'type' | 'item'): string => {
    return type === 'type' ? '字典类型' : '字典项'
  }

  const getDictTypeConfig = (type: 'type' | 'item') => {
    return type === 'type'
      ? { icon: 'mdi:folder-table', color: 'info' as const }
      : { icon: 'mdi:tag', color: 'success' as const }
  }

  const getDictTypeIconColor = (type: 'type' | 'item'): string => {
    return type === 'type' ? '#1890ff' : '#52c41a'
  }

  const findDictById = (dicts: DictData[], id: string): DictData | null => {
    for (const dict of dicts) {
      if (dict.id === id) return dict
      if (dict.children) {
        const found = findDictById(dict.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 更新字典项状态的函数
  const updateDictStatus = (
    dicts: DictData[],
    id: string,
    status: number
  ): boolean => {
    for (let i = 0; i < dicts.length; i++) {
      if (dicts[i].id === id) {
        dicts[i].status = status
        return true
      }
      if (dicts[i].children) {
        if (updateDictStatus(dicts[i].children!, id, status)) {
          return true
        }
      }
    }
    return false
  }

  // 事件处理
  const handleNodeSelect = (node: any, keys: (string | number)[]) => {
    selectedKeys.value = keys.map(k => String(k))
  }

  const handleNodeAction = (action: string, node: any) => {
    const dictNode = node as DictData

    switch (action) {
      case 'edit':
        handleEditDict(dictNode)
        break
      case 'delete':
        handleDeleteDict(dictNode.id)
        break
      case 'add':
        handleAddDictItem(dictNode.id)
        break
      case 'toggle':
        handleToggleStatus(dictNode)
        break
    }
  }

  const handleAddFromTree = (parentNode?: any) => {
    const dictNode = parentNode as DictData | undefined
    if (dictNode?.type === 'type') {
      handleAddDictItem(dictNode.id)
    } else {
      handleAddDict()
    }
  }

  const expandAll = () => {
    if (isAllExpanded.value) {
      // 调用组件的 collapseAll 方法
      treeRef.value?.collapseAll()
      isAllExpanded.value = false
    } else {
      // 调用组件的 expandAll 方法
      treeRef.value?.expandAll()
      isAllExpanded.value = true
    }
  }

  const refreshDicts = async () => {
    await loadDicts()
    message.success('刷新成功')
  }

  const handleAddDict = (parentId?: string) => {
    modalMode.value = 'add'
    Object.assign(formData, DEFAULT_DICT_FORM_DATA)
    if (parentId) {
      formData.parentId = parentId
      formData.type = 'item'
    }
    showModal.value = true
  }

  const handleAddDictItem = (parentId?: string) => {
    modalMode.value = 'add'
    Object.assign(formData, DEFAULT_DICT_FORM_DATA)
    formData.type = 'item'
    if (parentId) {
      formData.parentId = parentId
    } else if (selectedDict.value?.type === 'type') {
      formData.parentId = selectedDict.value.id
    }
    showModal.value = true
  }

  const handleEditDict = (dict: DictData) => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: dict.id,
      name: dict.name,
      type: dict.type,
      parentId: dict.parentId,
      code: dict.code,
      value: dict.value || '',
      sort: dict.sort,
      status: dict.status,
      remark: dict.remark || '',
      typeCode: dict.typeCode || '',
      dictLabel: dict.dictLabel || '',
      dictValue: dict.dictValue || '',
    })
    showModal.value = true
  }

  const handleDeleteDict = async (id: string) => {
    try {
      await deleteDictApi(id)
      message.success('删除成功')
      await loadDicts()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleStatus = async (dict: DictData) => {
    const newStatus = dict.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'

    try {
      await toggleDictStatusApi(dict.id, newStatus)
      message.success(`${statusText}成功`)

      // 立即更新本地状态，确保UI即时响应
      updateDictStatus(dictList, dict.id, newStatus)

      // 强制触发响应式更新
      nextTick(() => {
        // 如果当前选中的是被更新的字典，保持选中状态
        if (selectedDict.value?.id === dict.id) {
          selectedKeys.value = [...selectedKeys.value] // 触发响应式更新
        }
      })
    } catch {
      message.error(`${statusText}失败`)
    }
  }

  const handleSaveDict = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      // 根据类型设置对应字段
      if (formData.type === 'type') {
        formData.code = formData.typeCode
        formData.value = ''
      } else {
        formData.code = formData.dictLabel
        formData.value = formData.dictValue
      }

      if (modalMode.value === 'add') {
        await addDictApi(formData)
        message.success('添加成功')
        await loadDicts()
      } else {
        await updateDictApi(formData)
        message.success('修改成功')

        // 编辑模式：直接更新本地状态
        if (formData.id) {
          updateDictStatus(dictList, formData.id, formData.status)
        }
      }

      showModal.value = false
      return true
    } catch (error) {
      if (error instanceof Array) return false
      message.error('保存失败')
      return false
    }
  }

  const handleCancelModal = () => {
    showModal.value = false
    Object.assign(formData, DEFAULT_DICT_FORM_DATA)
  }

  const loadDicts = async () => {
    loading.value = true
    try {
      const response = await getDictListApi()

      // 清空并重新赋值以确保响应式更新
      dictList.length = 0
      dictList.push(...response.data)
    } catch {
      message.error('加载字典失败')
    } finally {
      loading.value = false
    }
  }

  // 生命周期
  onMounted(() => {
    loadDicts()
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
