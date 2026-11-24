<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-15
 * @FilePath: \Robot_Admin\src\views\sys-manage\permission-manage\index.vue
 * @Description: 权限管理 - 权限资源库 / 数据权限 / 临时授权 / 权限约束 / 审计日志 / 权限对比
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="permission-management">
    <input
      ref="importInputRef"
      type="file"
      accept=".json,application/json"
      hidden
      @change="view.permissionImport.read"
    />
    <!-- 搜索筛选区域 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace class="search-filters">
          <NInput
            v-model:value="view.resources.searchForm.keyword"
            placeholder="搜索权限名称、编码、描述"
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <C_Icon
                name="material-symbols:search"
                :size="16"
              />
            </template>
          </NInput>
          <NSelect
            v-model:value="view.resources.searchForm.type"
            placeholder="权限类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionType"
          />
          <NSelect
            v-model:value="view.resources.searchForm.module"
            placeholder="所属模块"
            clearable
            style="width: 120px"
            :options="SYSTEM_MODULES"
          />
          <NSelect
            v-model:value="view.resources.searchForm.status"
            placeholder="权限状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionStatus"
          />
        </NSpace>
        <NSpace>
          <NButton
            type="primary"
            :disabled="!view.mockMode"
            @click="view.resourceEditor.open()"
          >
            <template #icon>
              <C_Icon
                name="material-symbols:add"
                :size="16"
              />
            </template>
            新增权限
          </NButton>
          <NButton
            @click="view.resources.handleExport"
            :loading="view.resources.exportLoading"
          >
            <template #icon>
              <C_Icon
                name="material-symbols:download"
                :size="16"
              />
            </template>
            导出
          </NButton>
          <NButton
            @click="view.permissionImport.choose"
            :disabled="!view.mockMode"
            :title="
              view.mockMode
                ? '导入 JSON 权限数据'
                : '当前数据源暂不支持批量导入'
            "
          >
            <template #icon>
              <C_Icon
                name="material-symbols:upload"
                :size="16"
              />
            </template>
            导入
          </NButton>
          <NButton @click="view.handleRefresh">
            <template #icon>
              <C_Icon
                name="material-symbols:refresh"
                :size="16"
              />
            </template>
            刷新
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 功能标签页 -->
    <NAlert
      v-if="
        !view.governanceCapabilities.dataScope.write ||
        !view.governanceCapabilities.fieldPermission.write
      "
      type="info"
      :show-icon="false"
    >
      数据范围为有效角色的只读摘要；字段规则与通用约束尚不支持保存。临时授权按成员授予现有角色。
    </NAlert>
    <NTabs
      v-model:value="view.activeTab"
      type="card"
      animated
      class="main-tabs"
    >
      <!-- ==================== Tab 1: 权限资源库 ==================== -->
      <NTabPane
        name="resources"
        tab="权限资源库"
      >
        <NGrid
          :cols="4"
          :x-gap="16"
          class="stat-grid"
        >
          <NGi
            v-for="stat in view.resources.permissionStats"
            :key="stat.type"
          >
            <NCard
              size="small"
              hoverable
              :class="{
                'stat-card-active':
                  view.resources.searchForm.type === stat.type,
              }"
              class="stat-card-clickable"
              @click="view.resources.handleStatCardClick(stat.type)"
            >
              <NSpace align="center">
                <div class="stat-icon-wrapper">
                  <C_Icon
                    :name="stat.icon"
                    :size="24"
                    :color="stat.color"
                  />
                </div>
                <div class="stat-content">
                  <div class="stat-label">{{ stat.label }}</div>
                  <div class="stat-value">{{ stat.value }}</div>
                </div>
              </NSpace>
            </NCard>
          </NGi>
        </NGrid>

        <!-- 筛选标签显示 -->
        <div
          v-if="view.resources.hasActiveFilters"
          class="filter-tags"
        >
          <NSpace>
            <NText
              depth="3"
              style="margin-right: 8px"
            >
              当前筛选：
            </NText>
            <NTag
              v-if="view.resources.searchForm.keyword"
              closable
              @close="view.resources.clearFilter('keyword')"
              type="info"
            >
              关键词: {{ view.resources.searchForm.keyword }}
            </NTag>
            <NTag
              v-if="view.resources.searchForm.type"
              closable
              @close="view.resources.clearFilter('type')"
              type="success"
            >
              类型:
              {{ view.resources.getTypeLabel(view.resources.searchForm.type) }}
            </NTag>
            <NTag
              v-if="view.resources.searchForm.module"
              closable
              @close="view.resources.clearFilter('module')"
              type="warning"
            >
              模块:
              {{
                view.resources.getModuleName(view.resources.searchForm.module)
              }}
            </NTag>
            <NTag
              v-if="view.resources.searchForm.status !== null"
              closable
              @close="view.resources.clearFilter('status')"
              :type="
                view.resources.searchForm.status === 1 ? 'success' : 'error'
              "
            >
              状态:
              {{ view.resources.searchForm.status === 1 ? '启用' : '禁用' }}
            </NTag>
            <NButton
              text
              size="small"
              @click="view.resources.clearAllFilters"
              type="error"
            >
              清空筛选
            </NButton>
          </NSpace>
        </div>

        <NCard class="content-card">
          <template #header>
            <NText>
              权限资源库
              <NTag
                type="info"
                size="small"
                style="margin-left: 8px"
              >
                {{ view.resources.searchResultText }}
              </NTag>
            </NText>
          </template>

          <C_Table
            ref="tableRef"
            :data="view.resources.filteredData"
            :columns="view.resources.tableColumns"
            :loading="view.resources.loading"
            :config="{
              actions: view.resources.tableActions,
              edit: {
                mode: view.mockMode ? 'modal' : 'none',
                modalTitle: '编辑权限',
                modalWidth: 800,
                onSave: view.resources.handleSave,
              },
              display: { striped: true, bordered: true, size: 'small' },
            }"
            @row-delete="view.resources.handleRowDelete"
            @view-detail="view.resourceDetail.open"
          />
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 2: 数据权限 ==================== -->
      <NTabPane
        name="data-permission"
        tab="数据权限"
      >
        <NAlert
          v-if="!view.governanceCapabilities.fieldPermission.read"
          type="info"
          :show-icon="false"
        >
          字段权限模型未接入。当前服务仅提供有效角色的数据范围摘要。
        </NAlert>
        <NAlert
          v-else-if="view.mockMode"
          type="info"
          :show-icon="false"
        >
          Mock 字段权限数据仅用于演示，不代表远程服务已接入字段权限模型。
        </NAlert>
        <NCard class="content-card">
          <template #header>
            <NSpace
              justify="space-between"
              align="center"
            >
              <NText strong>数据权限规则配置</NText>
              <NButton
                type="primary"
                size="small"
                :disabled="!view.governanceCapabilities.dataScope.write"
                @click="view.dataPolicy.add"
              >
                <template #icon>
                  <C_Icon
                    name="material-symbols:add"
                    :size="14"
                  />
                </template>
                新增规则
              </NButton>
            </NSpace>
          </template>

          <C_Table
            :columns="view.dataPolicy.columns"
            :data="view.dataPolicy.rows"
            :loading="view.dataPolicy.loading"
            :row-key="view.dataPolicy.rowKey"
            :config="{
              toolbar: { show: false },
              pagination: false,
              display: { size: 'small', striped: true },
            }"
          >
            <template #loading>
              <C_Loading label="正在加载数据权限" />
            </template>
          </C_Table>
        </NCard>

        <!-- 数据权限详细配置 - 字段级权限 -->
        <NCard
          v-if="
            view.dataPolicy.selected &&
            view.governanceCapabilities.fieldPermission.read
          "
          class="content-card"
          style="margin-top: 16px"
        >
          <template #header>
            <NSpace align="center">
              <C_Icon
                name="mdi:shield-lock"
                :size="18"
              />
              <NText strong>
                字段权限配置 — {{ view.dataPolicy.selected.moduleName }}
              </NText>
            </NSpace>
          </template>

          <NGrid
            :cols="3"
            :x-gap="24"
          >
            <NGi
              v-for="field in view.dataPolicy.selected.fieldPermissions"
              :key="field.field"
            >
              <NCard
                size="small"
                :bordered="true"
                class="field-permission-card"
              >
                <NSpace
                  vertical
                  :size="8"
                >
                  <NText strong>{{ field.label }}</NText>
                  <NText
                    depth="3"
                    style="font-size: 12px"
                  >
                    字段名: {{ field.field }}
                  </NText>
                  <NSpace :size="16">
                    <NSwitch
                      v-model:value="field.visible"
                      size="small"
                      :disabled="!view.dataPolicy.canEditFields"
                    >
                      <template #checked>可见</template>
                      <template #unchecked>隐藏</template>
                    </NSwitch>
                    <NSwitch
                      v-model:value="field.editable"
                      size="small"
                      :disabled="
                        !view.dataPolicy.canEditFields || !field.visible
                      "
                    >
                      <template #checked>可编辑</template>
                      <template #unchecked>只读</template>
                    </NSwitch>
                    <NSwitch
                      v-model:value="field.masked"
                      size="small"
                      :disabled="
                        !view.dataPolicy.canEditFields || !field.visible
                      "
                    >
                      <template #checked>脱敏</template>
                      <template #unchecked>明文</template>
                    </NSwitch>
                  </NSpace>
                </NSpace>
              </NCard>
            </NGi>
          </NGrid>

          <NSpace
            justify="end"
            style="margin-top: 16px"
          >
            <NButton @click="view.dataPolicy.selected = null">取消</NButton>
            <NButton
              type="primary"
              :disabled="!view.dataPolicy.canEditFields"
              @click="view.dataPolicy.saveFields"
            >
              保存字段权限
            </NButton>
          </NSpace>
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 3: 临时授权 ==================== -->
      <NTabPane
        name="temp-auth"
        tab="临时授权"
      >
        <NCard class="content-card">
          <template #header>
            <NSpace
              justify="space-between"
              align="center"
            >
              <NSpace align="center">
                <NText strong>临时授权管理</NText>
                <NTag
                  type="success"
                  size="small"
                >
                  生效中: {{ view.temporaryGrants.activeCount }}
                </NTag>
              </NSpace>
              <NButton
                type="primary"
                size="small"
                :disabled="
                  !view.governanceCapabilities.temporaryRoleGrant.write
                "
                @click="view.temporaryGrants.visible = true"
              >
                <template #icon>
                  <C_Icon
                    name="mdi:shield-plus"
                    :size="14"
                  />
                </template>
                新增临时授权
              </NButton>
            </NSpace>
          </template>

          <C_Table
            :columns="view.temporaryGrants.columns"
            :data="view.temporaryGrants.rows"
            :loading="view.temporaryGrants.loading"
            :row-key="view.temporaryGrants.rowKey"
            :config="{
              toolbar: { show: false },
              pagination: false,
              display: { size: 'small', striped: true },
            }"
          >
            <template #loading>
              <C_Loading label="正在加载临时授权" />
            </template>
          </C_Table>
          <NPagination
            v-model:page="view.temporaryGrants.page"
            :item-count="view.temporaryGrants.total"
            :page-size="20"
            @update:page="view.temporaryGrants.load"
          />
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 4: 权限约束 ==================== -->
      <NTabPane
        name="constraints"
        tab="权限约束"
      >
        <NAlert
          type="info"
          :show-icon="false"
          >当前约束仅供配置摘要展示，尚未实现通用约束保存与执行引擎。</NAlert
        >
        <NCard
          v-for="constraint in view.constraints.readOnly"
          :key="constraint.id"
          size="small"
        >
          <NText strong>{{ constraint.ruleName }}</NText>
          <NP>{{ constraint.ruleType }} · {{ constraint.configJson }}</NP>
        </NCard>
        <NGrid
          :cols="2"
          :x-gap="16"
        >
          <!-- 互斥关系 -->
          <NGi>
            <NCard class="content-card">
              <template #header>
                <NSpace align="center">
                  <C_Icon
                    name="mdi:swap-horizontal"
                    :size="18"
                    color="#d03050"
                  />
                  <NText strong>互斥关系</NText>
                  <NTag
                    type="error"
                    size="small"
                  >
                    {{ view.constraints.mutualExclusion.length }} 条
                  </NTag>
                </NSpace>
              </template>

              <NList bordered>
                <NListItem
                  v-for="item in view.constraints.mutualExclusion"
                  :key="item.id"
                >
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NSpace align="center">
                      <NTag
                        type="warning"
                        size="small"
                      >
                        {{ item.sourceName }}
                      </NTag>
                      <C_Icon
                        name="mdi:swap-horizontal"
                        :size="16"
                        color="#d03050"
                      />
                      <NTag
                        type="warning"
                        size="small"
                      >
                        {{ item.targetName }}
                      </NTag>
                    </NSpace>
                    <NText
                      depth="3"
                      style="font-size: 12px"
                    >
                      {{ item.description }}
                    </NText>
                    <NText
                      depth="3"
                      style="font-size: 11px"
                    >
                      编码: {{ item.sourceCode }} ⇔ {{ item.targetCode }}
                    </NText>
                  </NSpace>
                </NListItem>
                <NEmpty
                  v-if="view.constraints.mutualExclusion.length === 0"
                  description="暂无互斥关系"
                />
              </NList>
            </NCard>
          </NGi>

          <!-- 继承关系 -->
          <NGi>
            <NCard class="content-card">
              <template #header>
                <NSpace align="center">
                  <C_Icon
                    name="mdi:arrow-down"
                    :size="18"
                    color="#2080f0"
                  />
                  <NText strong>继承关系</NText>
                  <NTag
                    type="info"
                    size="small"
                  >
                    {{ view.constraints.inheritance.length }} 条
                  </NTag>
                </NSpace>
              </template>

              <NList bordered>
                <NListItem
                  v-for="item in view.constraints.inheritance"
                  :key="item.id"
                >
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NSpace align="center">
                      <NTag
                        type="info"
                        size="small"
                      >
                        {{ item.sourceName }}
                      </NTag>
                      <C_Icon
                        name="mdi:arrow-right"
                        :size="16"
                        color="#2080f0"
                      />
                      <NTag
                        type="success"
                        size="small"
                      >
                        {{ item.targetName }}
                      </NTag>
                    </NSpace>
                    <NText
                      depth="3"
                      style="font-size: 12px"
                    >
                      {{ item.description }}
                    </NText>
                    <NText
                      depth="3"
                      style="font-size: 11px"
                    >
                      编码: {{ item.sourceCode }} → {{ item.targetCode }}
                    </NText>
                  </NSpace>
                </NListItem>
                <NEmpty
                  v-if="view.constraints.inheritance.length === 0"
                  description="暂无继承关系"
                />
              </NList>
            </NCard>
          </NGi>
        </NGrid>
      </NTabPane>

      <!-- ==================== Tab 5: 审计日志 ==================== -->
      <NTabPane
        name="audit-log"
        tab="审计日志"
      >
        <NCard class="content-card">
          <template #header>
            <NSpace
              justify="space-between"
              align="center"
            >
              <NText strong>权限变更日志</NText>
              <NSpace>
                <NInput
                  v-if="!view.mockMode"
                  v-model:value="view.audit.filter.action"
                  placeholder="动作编码（精确匹配）"
                  clearable
                  @change="view.audit.applyFilter"
                />
                <NInput
                  v-if="!view.mockMode"
                  v-model:value="view.audit.target"
                  placeholder="目标对象ID（精确匹配）"
                  clearable
                  @change="view.audit.applyFilter"
                />

                <NSelect
                  v-if="view.mockMode"
                  v-model:value="view.audit.filter.action"
                  placeholder="操作类型"
                  clearable
                  style="width: 120px"
                  :options="view.audit.actionOptions"
                />
                <NSelect
                  v-if="view.mockMode"
                  v-model:value="view.audit.filter.targetType"
                  placeholder="目标类型"
                  clearable
                  style="width: 120px"
                  :options="view.audit.targetOptions"
                />
              </NSpace>
            </NSpace>
          </template>

          <NTimeline>
            <NTimelineItem
              v-for="log in view.audit.rows"
              :key="log.id"
              :type="AUDIT_ACTION_CONFIG[log.action]?.type"
              :title="`${log.operatorName} ${log.actionRaw || AUDIT_ACTION_CONFIG[log.action]?.text || log.action} ${AUDIT_TARGET_CONFIG[log.targetType]?.text || '对象'}「${log.targetName}」`"
              :content="log.detail"
              :time="`${log.timestamp} | IP: ${log.ip}`"
            />
          </NTimeline>
          <NEmpty
            v-if="view.audit.rows.length === 0"
            description="暂无审计日志"
          />
          <NPagination
            v-model:page="view.audit.page"
            :item-count="view.audit.total"
            :page-size="20"
            @update:page="view.audit.load"
          />
        </NCard>
      </NTabPane>

      <!-- ==================== Tab 6: 权限对比 ==================== -->
      <NTabPane
        name="comparison"
        tab="权限对比"
      >
        <NCard class="content-card">
          <template #header>
            <NText strong>角色权限对比工具</NText>
          </template>

          <NSpace
            align="center"
            style="margin-bottom: 16px"
          >
            <NSelect
              v-model:value="view.comparison.roleA"
              placeholder="选择角色 A"
              style="width: 200px"
              :options="view.comparison.roleOptions"
            />
            <C_Icon
              name="mdi:swap-horizontal"
              :size="20"
            />
            <NSelect
              v-model:value="view.comparison.roleB"
              placeholder="选择角色 B"
              style="width: 200px"
              :options="view.comparison.roleOptions"
            />
            <NButton
              type="primary"
              :disabled="!view.comparison.roleA || !view.comparison.roleB"
              @click="view.comparison.compare"
            >
              开始对比
            </NButton>
          </NSpace>

          <div v-if="view.comparison.result">
            <NGrid
              :cols="3"
              :x-gap="16"
            >
              <NGi>
                <NCard
                  size="small"
                  :bordered="true"
                >
                  <template #header>
                    <NSpace align="center">
                      <NTag
                        type="success"
                        size="small"
                      >
                        共有权限
                      </NTag>
                      <NText depth="3">
                        {{ view.comparison.result.shared.length }} 项
                      </NText>
                    </NSpace>
                  </template>
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NTag
                      v-for="perm in view.comparison.result.shared"
                      :key="perm"
                      type="success"
                      size="small"
                    >
                      {{ perm }}
                    </NTag>
                    <NEmpty
                      v-if="view.comparison.result.shared.length === 0"
                      description="无共有权限"
                      size="small"
                    />
                  </NSpace>
                </NCard>
              </NGi>
              <NGi>
                <NCard
                  size="small"
                  :bordered="true"
                >
                  <template #header>
                    <NSpace align="center">
                      <NTag
                        type="info"
                        size="small"
                      >
                        仅 {{ view.comparison.result.roleAName }}
                      </NTag>
                      <NText depth="3">
                        {{ view.comparison.result.onlyA.length }} 项
                      </NText>
                    </NSpace>
                  </template>
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NTag
                      v-for="perm in view.comparison.result.onlyA"
                      :key="perm"
                      type="info"
                      size="small"
                    >
                      {{ perm }}
                    </NTag>
                    <NEmpty
                      v-if="view.comparison.result.onlyA.length === 0"
                      description="无独有权限"
                      size="small"
                    />
                  </NSpace>
                </NCard>
              </NGi>
              <NGi>
                <NCard
                  size="small"
                  :bordered="true"
                >
                  <template #header>
                    <NSpace align="center">
                      <NTag
                        type="warning"
                        size="small"
                      >
                        仅 {{ view.comparison.result.roleBName }}
                      </NTag>
                      <NText depth="3">
                        {{ view.comparison.result.onlyB.length }} 项
                      </NText>
                    </NSpace>
                  </template>
                  <NSpace
                    vertical
                    :size="4"
                  >
                    <NTag
                      v-for="perm in view.comparison.result.onlyB"
                      :key="perm"
                      type="warning"
                      size="small"
                    >
                      {{ perm }}
                    </NTag>
                    <NEmpty
                      v-if="view.comparison.result.onlyB.length === 0"
                      description="无独有权限"
                      size="small"
                    />
                  </NSpace>
                </NCard>
              </NGi>
            </NGrid>
          </div>
          <NEmpty
            v-else
            description="选择两个角色进行权限对比"
          />
        </NCard>
      </NTabPane>
    </NTabs>

    <!-- ==================== 权限详情抽屉 ==================== -->
    <c_detail
      v-model:visible="view.resourceDetail.visible"
      :data="view.resourceDetail.current || {}"
      :config="view.resourceDetail.config"
      title="权限详情"
      :loading="view.resourceDetail.loading"
      @close="view.resourceDetail.close"
    />

    <!-- ==================== 新增/编辑权限模态框 ==================== -->
    <NModal
      v-model:show="view.resourceEditor.visible"
      preset="dialog"
      :title="view.resourceEditor.title"
      :positive-text="
        view.resourceEditor.mode === 'add' ? '确认添加' : '确认修改'
      "
      negative-text="取消"
      @positive-click="() => view.formRef?.submit() ?? false"
      :closable="!view.formRef?.isSubmitting"
      :mask-closable="!view.formRef?.isSubmitting"
      :close-on-esc="!view.formRef?.isSubmitting"
      :negative-button-props="{ disabled: !!view.formRef?.isSubmitting }"
      @negative-click="view.resourceEditor.close"
      style="width: 700px"
    >
      <C_Form
        v-if="view.resourceEditor.visible"
        ref="formRef"
        :model-value="view.resourceEditor.data"
        @update:model-value="view.resourceEditor.update"
        :options="view.resourceEditor.options"
        :config="view.resourceEditor.config"
        :renderers="view.resourceEditor.renderers"
        @submit="view.resourceEditor.visible = false"
      />
    </NModal>

    <!-- ==================== 临时授权模态框 ==================== -->
    <NModal
      v-model:show="view.temporaryGrants.visible"
      preset="dialog"
      title="新增临时授权"
      positive-text="确认授权"
      negative-text="取消"
      @positive-click="() => view.tempAuthFormRef?.submit() ?? false"
      :closable="!view.tempAuthFormRef?.isSubmitting"
      :mask-closable="!view.tempAuthFormRef?.isSubmitting"
      :close-on-esc="!view.tempAuthFormRef?.isSubmitting"
      :negative-button-props="{
        disabled: !!view.tempAuthFormRef?.isSubmitting,
      }"
      style="width: 650px"
    >
      <p>有效期按您当前浏览器的时区选择和显示。</p>
      <C_Form
        v-if="view.temporaryGrants.visible"
        ref="tempAuthFormRef"
        :model-value="view.temporaryGrants.form"
        @update:model-value="Object.assign(view.temporaryGrants.form, $event)"
        :options="view.temporaryGrants.options"
        :config="view.temporaryGrants.config"
        @submit="view.temporaryGrants.visible = false"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import {
    UI_CONFIG,
    SYSTEM_MODULES,
    AUDIT_ACTION_CONFIG,
    AUDIT_TARGET_CONFIG,
  } from './data'
  import { usePermissionManagement } from './usePermissionManagement'

  defineOptions({ name: 'PermissionManage' })
  const controller = usePermissionManagement()
  const view = proxyRefs(controller)
  const { permissionImport, tableRef, formRef, tempAuthFormRef } = controller
  const { inputRef: importInputRef } = permissionImport
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
