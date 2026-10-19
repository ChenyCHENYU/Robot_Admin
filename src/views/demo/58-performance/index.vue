<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 团队绩效看板，交付、质量与周期的一致口径演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="performance-board"
    ><header class="performance-heading"
      ><div
        ><small>TEAM PERFORMANCE / ROBOT ADMIN</small><h1>团队绩效看板</h1></div
      ><div class="performance-actions"
        ><span>演示数据 · 6 周交付记录</span
        ><NSelect
          v-model:value="week"
          size="small"
          :options="PERFORMANCE_WEEKS"
          aria-label="绩效统计周"
        /><NButton
          size="small"
          @click="exportCsv"
          >导出当前范围</NButton
        ><NButton
          size="small"
          @click="router.push('/home')"
          >返回工作台</NButton
        ></div
      ></header
    >
    <section class="performance-kpis"
      ><article
        ><span>交付完成率</span
        ><strong>{{ summary.delivery.toFixed(1) }}<small>%</small></strong
        ><p
          >{{ summary.delivered }} / {{ summary.planned }} 项计划任务</p
        ></article
      ><article
        ><span>验收通过率</span
        ><strong>{{ summary.quality.toFixed(1) }}<small>%</small></strong
        ><p
          >{{ summary.accepted }} / {{ summary.checked }} 项验收任务</p
        ></article
      ><article
        ><span>平均交付周期</span
        ><strong>{{ summary.cycle.toFixed(1) }}<small>天 / 项</small></strong
        ><p>按完成任务量加权</p></article
      ><article
        ><span>计划待交付</span
        ><strong
          >{{ Math.max(0, summary.planned - summary.delivered)
          }}<small>项</small></strong
        ><p
          >{{ selectedTeam === 'all' ? '全部团队' : scope[0].name }} · 第
          {{ week + 1 }} 周</p
        ></article
      ></section
    >
    <div class="performance-main"
      ><aside class="performance-panel performance-teams"
        ><h2>团队范围</h2
        ><button
          type="button"
          :aria-pressed="selectedTeam === 'all'"
          @click="selectedTeam = 'all'"
          ><strong>全部团队</strong
          ><small>{{ PERFORMANCE_TEAMS.length }} 个协作团队</small></button
        ><button
          v-for="team in PERFORMANCE_TEAMS"
          :key="team.id"
          type="button"
          :aria-pressed="selectedTeam === team.id"
          @click="selectedTeam = team.id"
          ><strong>{{ team.name }}</strong
          ><small>{{ team.note }}</small></button
        ><p>选择团队后，指标、趋势和明细同步切换。</p></aside
      >
      <section class="performance-panel performance-trend"
        ><header
          ><div><h2>交付节奏</h2><p>近六周的计划与完成任务</p></div
          ><span><i />已完成 <b />计划</span></header
        ><div class="performance-bars"
          ><button
            v-for="(point, index) in trend"
            :key="index"
            type="button"
            :class="{ active: week === index }"
            :aria-label="`查看第 ${index + 1} 周绩效`"
            @click="week = index"
            ><span class="bar-values"
              >{{ point.delivered }} / {{ point.planned }}</span
            ><div class="bar-pair"
              ><i
                :style="{
                  height: `${(point.delivered / maxPlan) * 100}%`,
                }" /><b
                :style="{
                  height: `${(point.planned / maxPlan) * 100}%`,
                }" /></div
            ><small>第 {{ index + 1 }} 周</small></button
          ></div
        ><footer>趋势按同一团队范围计算，点击柱组切换统计周。</footer></section
      >
      <section class="performance-panel performance-quality"
        ><h2>本周质量与节奏</h2
        ><div
          v-for="team in scope"
          :key="team.id"
          class="performance-quality-row"
          ><strong>{{ team.name }}</strong
          ><span
            >{{
              (
                (team.weeks[week].accepted / team.weeks[week].checked) *
                100
              ).toFixed(1)
            }}% 验收通过</span
          ><div
            ><i
              :style="{
                width: `${(team.weeks[week].accepted / team.weeks[week].checked) * 100}%`,
              }" /></div
          ><small
            >平均周期
            {{
              (team.weeks[week].cycleDays / team.weeks[week].delivered).toFixed(
                1
              )
            }}
            天 / 项</small
          ></div
        ></section
      ></div
    >
    <section class="performance-panel performance-detail"
      ><header
        ><h2>交付明细</h2
        ><span>第 {{ week + 1 }} 周 · {{ scope.length }} 个团队</span></header
      ><div class="performance-table"
        ><table
          ><thead
            ><tr
              ><th>协作团队</th><th>计划任务</th><th>完成任务</th
              ><th>交付完成率</th><th>验收通过率</th><th>平均周期</th></tr
            ></thead
          ><tbody
            ><tr
              v-for="team in scope"
              :key="team.id"
              ><th>{{ team.name }}</th
              ><td>{{ team.weeks[week].planned }}</td
              ><td>{{ team.weeks[week].delivered }}</td
              ><td
                >{{
                  (
                    (team.weeks[week].delivered / team.weeks[week].planned) *
                    100
                  ).toFixed(1)
                }}%</td
              ><td
                >{{
                  (
                    (team.weeks[week].accepted / team.weeks[week].checked) *
                    100
                  ).toFixed(1)
                }}%</td
              ><td
                >{{
                  (
                    team.weeks[week].cycleDays / team.weeks[week].delivered
                  ).toFixed(1)
                }}
                天</td
              ></tr
            ></tbody
          ></table
        ></div
      ></section
    >
    <footer class="performance-notes"
      >口径：交付率 = 完成 / 计划；通过率 = 通过 / 验收；周期 = 累计任务耗时 /
      完成任务。此看板展示团队交付表现，不用于个人评价。</footer
    >
  </div>
</template>
<script setup lang="ts">
  import {
    PERFORMANCE_TEAMS,
    PERFORMANCE_WEEKS,
    summarizePerformance,
  } from './data'
  defineOptions({ name: 'Demo58Performance' })
  const router = useRouter()
  const week = ref(5)
  const selectedTeam = ref('all')
  const scope = computed(() =>
    PERFORMANCE_TEAMS.filter(
      team => selectedTeam.value === 'all' || team.id === selectedTeam.value
    )
  )
  const summary = computed(() => summarizePerformance(scope.value, week.value))
  const trend = computed(() =>
    PERFORMANCE_WEEKS.map((_, index) =>
      summarizePerformance(scope.value, index)
    )
  )
  const maxPlan = computed(() =>
    Math.max(...trend.value.map(point => point.planned), 1)
  )
  const exportCsv = () => {
    const rows = [
      [
        '团队',
        '周次',
        '计划任务',
        '完成任务',
        '验收任务',
        '通过任务',
        '累计耗时（天）',
      ],
      ...scope.value.map(team => {
        const item = team.weeks[week.value]
        return [
          team.name,
          week.value + 1,
          item.planned,
          item.delivered,
          item.checked,
          item.accepted,
          item.cycleDays,
        ]
      }),
    ]
    const text =
      '\ufeff' +
      rows
        .map(row =>
          row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n')
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/csv;charset=utf-8' })
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `team-performance-week-${week.value + 1}.csv`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
