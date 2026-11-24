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
          ><i :class="{ 'is-session': !page.storageAvailable }" />{{
            page.storageAvailable ? '本机自动保存' : '仅当前会话'
          }}</span
        >
        <NButton
          size="small"
          type="primary"
          :disabled="!page.editable"
          @click="page.openEditor()"
          ><template #icon><span class="i-mdi:plus" /></template
          >新建日程</NButton
        >
      </div>
    </header>
    <div class="calendar-summary"
      ><div
        ><strong>{{ page.stats.today }}</strong
        ><span>今日安排</span></div
      ><div
        ><strong>{{ page.stats.week }}</strong
        ><span>本周日程</span></div
      ><div
        ><strong>{{ page.stats.total }}</strong
        ><span>全部日程</span></div
      ><p>点击日期查看安排 · 支持跨日与全天日程 · 框选多天创建全天安排</p></div
    >
    <div class="calendar-layout">
      <aside class="calendar-sidebar">
        <section class="calendar-sidebar__section">
          <h2
            >我的日历
            <small
              >{{ page.categories.length }} / {{ CATEGORIES.length }}</small
            ></h2
          >
          <button
            v-for="category in CATEGORIES"
            :key="category.value"
            class="calendar-category"
            type="button"
            :aria-pressed="page.categories.includes(category.value)"
            @click="page.toggleCategory(category.value)"
          >
            <span
              class="calendar-category__check"
              aria-hidden="true"
              :style="{ '--category-color': category.color }"
              >{{ page.categories.includes(category.value) ? '✓' : '' }}</span
            ><span>{{ category.label }}</span
            ><small>{{
              page.events.filter(event => event.category === category.value)
                .length
            }}</small>
          </button>
        </section>
        <section class="calendar-sidebar__section calendar-agenda">
          <div class="calendar-agenda__heading"
            ><div
              ><span>当日安排</span><h2>{{ page.selectedDayLabel }}</h2></div
            ><strong>{{ page.agenda.length }}</strong></div
          >
          <div
            v-if="page.agenda.length"
            class="calendar-agenda__items"
          >
            <button
              v-for="event in page.agenda"
              :key="event.id"
              type="button"
              class="calendar-agenda__event"
              :style="{
                '--event-color': page.categoryMeta(event.category).color,
              }"
              @click="page.openEditor(event)"
            >
              <small>{{ page.eventTime(event) }}</small
              ><strong>{{ event.title }}</strong
              ><span>{{
                event.location || page.categoryMeta(event.category).label
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
            :disabled="!page.editable"
            @click="page.restoreSamples"
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
              @click="page.navigate('prev')"
              >‹</button
            ><h2>{{ page.calendarTitle }}</h2
            ><button
              type="button"
              aria-label="下一时段"
              @click="page.navigate('next')"
              >›</button
            ><NButton
              size="tiny"
              @click="page.navigate('today')"
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
              :aria-pressed="page.view === item.value"
              @click="page.view = item.value"
              >{{ item.label }}</button
            ></div
          >
        </div>
        <div class="calendar-filters"
          ><NInput
            v-model:value="page.search"
            size="small"
            clearable
            placeholder="搜索标题、地点或备注"
            :input-props="{ 'aria-label': '搜索日程' }"
            ><template #prefix><span class="i-mdi:magnify" /></template></NInput
          ><NCheckbox v-model:checked="page.showWeekends">显示周末</NCheckbox
          ><NCheckbox v-model:checked="page.editable">允许编辑</NCheckbox></div
        >
        <C_FullCalendar
          ref="calendarRef"
          :events="page.filteredEvents"
          :initial-view="page.view"
          :editable="page.editable"
          :config="page.calendarConfig"
          :show-add-dialog="false"
          :show-edit-dialog="false"
          @update:events="page.updateVisibleEvents"
        />
        <footer class="calendar-main__footer"
          ><span
            >{{ page.filteredEvents.length }} 条可见日程<span
              v-if="!page.editable"
            >
              · 只读模式</span
            ></span
          ><div
            ><NButton
              size="tiny"
              :disabled="!page.editable"
              @click="page.fileRef?.click()"
              >导入备份</NButton
            ><NButton
              size="tiny"
              @click="page.exportBackup"
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
      @change="page.importBackup"
    />
    <NModal
      v-model:show="page.showEditor"
      preset="card"
      :title="
        page.editable ? (page.draft.id ? '编辑日程' : '新建日程') : '日程详情'
      "
      class="calendar-editor"
      :style="{ width: 'min(560px, calc(100vw - 32px))' }"
      :bordered="false"
    >
      <template v-if="page.editable"
        ><C_Form
          ref="formRef"
          v-model="page.draft"
          :options="page.fields"
          :config="page.formConfig"
        />
        <section
          class="calendar-recurrence"
          aria-label="日程重复规则"
        >
          <C_RecurrenceEditor
            v-model="page.recurrence"
            density="compact"
          />
          <p>重复规则随日程保存，日历展示起始日程。</p>
          <output
            v-if="page.recurrenceText"
            data-testid="calendar-recurrence-rule"
            >{{ page.recurrenceText }}</output
          >
        </section>
        <NAlert
          v-if="page.conflicts.length"
          type="warning"
          :bordered="false"
          class="calendar-conflict"
          >同一时间还有 {{ page.conflicts.length }} 条日程：{{
            page.conflicts.map(event => event.title).join('、')
          }}。请确认时间安排。</NAlert
        ></template
      >
      <NDescriptions
        v-else
        label-placement="top"
        :column="1"
        bordered
        ><NDescriptionsItem label="标题">{{
          page.draft.title
        }}</NDescriptionsItem
        ><NDescriptionsItem label="分类">{{
          page.categoryMeta(page.draft.category).label
        }}</NDescriptionsItem
        ><NDescriptionsItem label="日程类型">{{
          page.draft.allDay ? '全天日程' : '时间段日程'
        }}</NDescriptionsItem
        ><NDescriptionsItem
          :label="page.draft.allDay ? '开始日期' : '开始时间'"
          >{{ page.draftDateLabel(page.draft.start) }}</NDescriptionsItem
        ><NDescriptionsItem
          :label="page.draft.allDay ? '结束日期（含当天）' : '结束时间'"
          >{{ page.draftDateLabel(page.draft.end) }}</NDescriptionsItem
        ><NDescriptionsItem label="地点">{{
          page.draft.location || '—'
        }}</NDescriptionsItem
        ><NDescriptionsItem label="备注">{{
          page.draft.description || '—'
        }}</NDescriptionsItem>
        <NDescriptionsItem
          v-if="page.recurrenceText"
          label="重复规则"
          >{{ page.recurrenceText }}</NDescriptionsItem
        >
      </NDescriptions>
      <template #footer
        ><div class="calendar-editor__footer"
          ><div
            ><NButton
              v-if="page.draft.id && page.editable"
              size="small"
              type="error"
              quaternary
              @click="page.deleteSchedule"
              >删除</NButton
            ><NButton
              v-if="page.draft.id && page.editable"
              size="small"
              quaternary
              @click="page.duplicateSchedule"
              >复制日程</NButton
            ></div
          ><div
            ><NButton
              size="small"
              @click="page.showEditor = false"
              >{{ page.editable ? '取消' : '关闭' }}</NButton
            ><NButton
              v-if="page.editable"
              size="small"
              type="primary"
              @click="page.formRef?.submit()"
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
  const controller = useCalendarWorkspace()
  const page = proxyRefs(controller)
  const { calendarRef, fileRef, formRef } = controller
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
