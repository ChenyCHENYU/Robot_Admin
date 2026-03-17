<script setup lang="ts">
  import { ref } from 'vue'

  const collapsed = ref(false)

  // 示例数据 — 实际接入 API 后替换
  const energyStats = ref([
    { label: '用电量(kWh)', value: '2,904,510.14', ratio: '+3%', trend: 'up' },
    {
      label: '工业水用量(m³)',
      value: '15,320.50',
      ratio: '-1.2%',
      trend: 'down',
    },
    { label: '燃气用量(m³)', value: '8,756.30', ratio: '+0.8%', trend: 'up' },
  ])

  const productStats = ref([
    { name: '球团矿', unit: '吨', daily: '12,500', monthly: '375,000' },
    { name: '铁精粉', unit: '吨', daily: '8,200', monthly: '246,000' },
    { name: '膨润土', unit: '吨', daily: '1,500', monthly: '45,000' },
  ])
</script>

<template>
  <div
    class="data-panel"
    :class="{ 'data-panel--collapsed': collapsed }"
  >
    <button
      class="data-panel__toggle"
      @click="collapsed = !collapsed"
    >
      {{ collapsed ? '◂ 展开' : '▸ 收起' }}
    </button>

    <template v-if="!collapsed">
      <!-- 能耗统计 -->
      <section class="data-panel__section">
        <h3 class="data-panel__title"> 能耗统计 </h3>
        <div class="data-panel__grid">
          <div
            v-for="item in energyStats"
            :key="item.label"
            class="data-panel__stat"
          >
            <span class="data-panel__stat-label">{{ item.label }}</span>
            <span class="data-panel__stat-value">{{ item.value }}</span>
            <span
              class="data-panel__stat-ratio"
              :class="item.trend === 'up' ? 'ratio-up' : 'ratio-down'"
            >
              环比：{{ item.ratio }}
              {{ item.trend === 'up' ? '↑' : '↓' }}
            </span>
          </div>
        </div>
      </section>

      <!-- 产品产量 -->
      <section class="data-panel__section">
        <h3 class="data-panel__title"> 产品产量 </h3>
        <div class="data-panel__table">
          <div class="data-panel__row data-panel__row--header">
            <span>产品名称</span>
            <span>单位</span>
            <span>日累计</span>
            <span>月累计</span>
          </div>
          <div
            v-for="item in productStats"
            :key="item.name"
            class="data-panel__row"
          >
            <span class="data-panel__row-name">{{ item.name }}</span>
            <span>{{ item.unit }}</span>
            <span>{{ item.daily }}</span>
            <span>{{ item.monthly }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .data-panel {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: width 0.3s;

    &--collapsed {
      width: auto;
    }

    &__toggle {
      align-self: flex-end;
      padding: 4px 12px;
      background: rgba(0, 20, 50, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(100, 200, 255, 0.2);
      border-radius: 6px;
      color: rgba(139, 235, 255, 0.7);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.25s;

      &:hover {
        border-color: rgba(100, 200, 255, 0.5);
        color: #8bebff;
      }
    }

    &__section {
      background: rgba(0, 15, 40, 0.8);
      border: 1px solid rgba(100, 200, 255, 0.18);
      border-radius: 8px;
      padding: 12px;
      backdrop-filter: blur(12px);
    }

    &__title {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 600;
      color: rgba(139, 235, 255, 0.8);
      letter-spacing: 1px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(100, 200, 255, 0.12);
    }

    &__grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    &__stat {
      display: flex;
      flex-direction: column;
      gap: 2px;

      &-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }

      &-value {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        font-variant-numeric: tabular-nums;
      }

      &-ratio {
        font-size: 12px;

        &.ratio-up {
          color: #ff5252;
        }

        &.ratio-down {
          color: #4caf50;
        }
      }
    }

    &__table {
      display: flex;
      flex-direction: column;
    }

    &__row {
      display: grid;
      grid-template-columns: 1.5fr 0.8fr 1fr 1fr;
      padding: 6px 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      border-bottom: 1px solid rgba(100, 200, 255, 0.08);

      &--header {
        color: rgba(139, 235, 255, 0.7);
        font-weight: 600;
        border-bottom: 1px solid rgba(100, 200, 255, 0.2);
      }

      &-name {
        color: #8bebff;
      }
    }
  }
</style>
