<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 日历工作台，分类筛选、日程侧栏与本地编辑备份
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="calendar-workspace">
    <header class="calendar-heading">
      <div
        ><span class="calendar-kicker">PLAN YOUR NEXT MOVE</span
        ><h1>日程工作台</h1
        ><p>把会议、交付与专注时间，安排在同一张日历里。</p></div
      >
      <div class="calendar-heading__actions">
        <span class="calendar-storage"
          ><i :class="{ 'is-session': !storageAvailable }" />{{
            storageAvailable ? '本机自动保存' : '仅当前会话'
          }}</span
        >
        <NButton
          size="small"
          type="primary"
          :disabled="!editable"
          @click="openEditor()"
          ><template #icon><span class="i-mdi:plus" /></template
          >新建日程</NButton
        >
      </div>
    </header>
    <div class="calendar-summary"
      ><div
        ><strong>{{ stats.today }}</strong
        ><span>今日安排</span></div
      ><div
        ><strong>{{ stats.week }}</strong
        ><span>本周日程</span></div
      ><div
        ><strong>{{ stats.total }}</strong
        ><span>全部日程</span></div
      ><p>点击日期查看安排 · 拖动事件调整日期 · 框选日期创建全天日程</p></div
    >
    <div class="calendar-layout">
      <aside class="calendar-sidebar">
        <section class="calendar-sidebar__section">
          <h2
            >我的日历
            <small>{{ categories.length }} / {{ CATEGORIES.length }}</small></h2
          >
          <button
            v-for="category in CATEGORIES"
            :key="category.value"
            class="calendar-category"
            type="button"
            :aria-pressed="categories.includes(category.value)"
            @click="toggleCategory(category.value)"
          >
            <span
              class="calendar-category__check"
              aria-hidden="true"
              :style="{ '--category-color': category.color }"
              >{{ categories.includes(category.value) ? '✓' : '' }}</span
            ><span>{{ category.label }}</span
            ><small>{{
              events.filter(event => event.category === category.value).length
            }}</small>
          </button>
        </section>
        <section class="calendar-sidebar__section calendar-agenda">
          <div class="calendar-agenda__heading"
            ><div
              ><span>当日安排</span><h2>{{ selectedDayLabel }}</h2></div
            ><strong>{{ agenda.length }}</strong></div
          >
          <div
            v-if="agenda.length"
            class="calendar-agenda__items"
          >
            <button
              v-for="event in agenda"
              :key="event.id"
              type="button"
              class="calendar-agenda__event"
              :style="{ '--event-color': categoryMeta(event.category).color }"
              @click="openEditor(event)"
            >
              <small>{{ eventTime(event) }}</small
              ><strong>{{ event.title }}</strong
              ><span>{{
                event.location || categoryMeta(event.category).label
              }}</span>
            </button>
          </div>
          <div
            v-else
            class="calendar-agenda__empty"
            ><span class="i-mdi:calendar-blank-outline" /><strong
              >留一点时间给自己</strong
            ><p>这一天没有符合筛选条件的安排</p></div
          >
        </section>
        <footer class="calendar-sidebar__footer"
          ><span>日程保存在当前浏览器</span
          ><NButton
            text
            size="tiny"
            :disabled="!editable"
            @click="restoreSamples"
            >恢复示例</NButton
          ></footer
        >
      </aside>
      <section
        class="calendar-main"
        aria-label="日历"
      >
        <div class="calendar-toolbar">
          <div class="calendar-navigation"
            ><button
              type="button"
              aria-label="上一时段"
              @click="navigate('prev')"
              >‹</button
            ><h2>{{ calendarTitle }}</h2
            ><button
              type="button"
              aria-label="下一时段"
              @click="navigate('next')"
              >›</button
            ><NButton
              size="tiny"
              @click="navigate('today')"
              >今天</NButton
            ></div
          >
          <div
            class="calendar-views"
            aria-label="日历视图"
            ><button
              v-for="item in VIEW_OPTIONS"
              :key="item.value"
              type="button"
              :aria-pressed="view === item.value"
              @click="view = item.value"
              >{{ item.label }}</button
            ></div
          >
        </div>
        <div class="calendar-filters"
          ><NInput
            v-model:value="search"
            size="small"
            clearable
            placeholder="搜索标题、地点或备注"
            :input-props="{ 'aria-label': '搜索日程' }"
            ><template #prefix><span class="i-mdi:magnify" /></template></NInput
          ><NCheckbox v-model:checked="showWeekends">显示周末</NCheckbox
          ><NCheckbox v-model:checked="editable">允许编辑</NCheckbox></div
        >
        <C_FullCalendar
          ref="calendarRef"
          :events="filteredEvents"
          :initial-view="view"
          :editable="editable"
          :config="calendarConfig"
          :show-add-dialog="false"
          :show-edit-dialog="false"
          @update:events="updateVisibleEvents"
        />
        <footer class="calendar-main__footer"
          ><span
            >{{ filteredEvents.length }} 条可见日程<span v-if="!editable">
              · 只读模式</span
            ></span
          ><div
            ><NButton
              size="tiny"
              :disabled="!editable"
              @click="fileRef?.click()"
              >导入备份</NButton
            ><NButton
              size="tiny"
              @click="exportBackup"
              >导出备份</NButton
            ></div
          ></footer
        >
      </section>
    </div>
    <input
      ref="fileRef"
      type="file"
      accept="application/json,.json"
      class="calendar-file-input"
      aria-label="选择日程备份"
      @change="importBackup"
    />
    <NModal
      v-model:show="showEditor"
      preset="card"
      :title="editable ? (draft.id ? '编辑日程' : '新建日程') : '日程详情'"
      class="calendar-editor"
      :style="{ width: 'min(560px, calc(100vw - 32px))' }"
      :bordered="false"
    >
      <template v-if="editable"
        ><C_Form
          ref="formRef"
          v-model="draft"
          :options="fields"
          :config="formConfig"
        /><NAlert
          v-if="conflicts.length"
          type="warning"
          :bordered="false"
          class="calendar-conflict"
          >同一时间还有 {{ conflicts.length }} 条日程：{{
            conflicts.map(event => event.title).join('、')
          }}。请确认时间安排。</NAlert
        ></template
      >
      <NDescriptions
        v-else
        label-placement="top"
        :column="1"
        bordered
        ><NDescriptionsItem label="标题">{{ draft.title }}</NDescriptionsItem
        ><NDescriptionsItem label="分类">{{
          categoryMeta(draft.category).label
        }}</NDescriptionsItem
        ><NDescriptionsItem label="日程类型">{{
          draft.allDay ? '全天日程' : '时间段日程'
        }}</NDescriptionsItem
        ><NDescriptionsItem :label="draft.allDay ? '开始日期' : '开始时间'">{{
          draftDateLabel(draft.start)
        }}</NDescriptionsItem
        ><NDescriptionsItem
          :label="draft.allDay ? '结束日期（含当天）' : '结束时间'"
          >{{ draftDateLabel(draft.end) }}</NDescriptionsItem
        ><NDescriptionsItem label="地点">{{
          draft.location || '—'
        }}</NDescriptionsItem
        ><NDescriptionsItem label="备注">{{
          draft.description || '—'
        }}</NDescriptionsItem></NDescriptions
      >
      <template #footer
        ><div class="calendar-editor__footer"
          ><div
            ><NButton
              v-if="draft.id && editable"
              size="small"
              type="error"
              quaternary
              @click="deleteSchedule"
              >删除</NButton
            ><NButton
              v-if="draft.id && editable"
              size="small"
              quaternary
              @click="duplicateSchedule"
              >复制日程</NButton
            ></div
          ><div
            ><NButton
              size="small"
              @click="showEditor = false"
              >{{ editable ? '取消' : '关闭' }}</NButton
            ><NButton
              v-if="editable"
              size="small"
              type="primary"
              @click="formRef?.submit()"
              >保存日程</NButton
            ></div
          ></div
        ></template
      >
    </NModal>
  </div>
</template>
<script setup lang="ts">
  import { CATEGORIES } from './data'
  import type { CalendarViewType } from '@robot-admin/naive-ui-components/C_FullCalendar'
  import { useCalendarWorkspace } from './useCalendarWorkspace'
  defineOptions({ name: 'Demo13Calendar' })
  const VIEW_OPTIONS: Array<{ label: string; value: CalendarViewType }> = [
    { label: '月', value: 'dayGridMonth' },
    { label: '周', value: 'dayGridWeek' },
    { label: '日', value: 'dayGridDay' },
    { label: '日程', value: 'listWeek' },
  ]
  const {
    calendarRef,
    formRef,
    fileRef,
    events,
    editable,
    showWeekends,
    search,
    categories,
    selectedDayLabel,
    view,
    calendarTitle,
    showEditor,
    draft,
    filteredEvents,
    agenda,
    stats,
    fields,
    formConfig,
    conflicts,
    calendarConfig,
    storageAvailable,
    categoryMeta,
    eventTime,
    draftDateLabel,
    toggleCategory,
    openEditor,
    deleteSchedule,
    duplicateSchedule,
    updateVisibleEvents,
    navigate,
    exportBackup,
    importBackup,
    restoreSamples,
  } = useCalendarWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
