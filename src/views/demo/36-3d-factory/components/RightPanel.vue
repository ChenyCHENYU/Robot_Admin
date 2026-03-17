<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  const isOpen = ref(false)

  // ---- 能耗统计 ----
  const energyCards = ref([
    {
      icon: '/3d-assets/fac/dian.png',
      label: '电(KWH)',
      daily: '7,817',
      monthly: '4,009,410',
    },
    {
      icon: '/3d-assets/fac/shui.png',
      label: '工业水(m³)',
      daily: '100',
      monthly: '7,254',
    },
    {
      icon: '/3d-assets/fac/qi.png',
      label: '蒸汽(m³)',
      daily: '9',
      monthly: '430.3',
    },
  ])

  // ---- 原辅料库存 ----
  const materialHeaders = ['物料名称', '规格', '类型', '当日库存']
  const materialData = ref([
    {
      name: '乌克兰精粉',
      spec: '铁山26-2 外购 65',
      type: '铁料',
      stock: '49,988.72',
    },
    {
      name: '冰纳阿加迪球团粉',
      spec: '裕义 外购 67%',
      type: '历基料',
      stock: '97,642.4',
    },
    { name: '奎立山石子', spec: '', type: '脱基料', stock: '403.57' },
    {
      name: 'vale筛灰',
      spec: 'NSU TUBARAO',
      type: '铁基料',
      stock: '39,279.24',
    },
    {
      name: '酸性球团矿',
      spec: '自产',
      type: '铁料',
      stock: '131,172.97',
    },
    { name: '膨润土', spec: '外购', type: '辅料', stock: '2,840.5' },
    {
      name: '铁精粉A',
      spec: '外购 66%',
      type: '铁料',
      stock: '18,500.0',
    },
  ])

  // ---- 产品产量 ----
  const productHeaders = ['产品名称', '规格', '单位', '日累计', '月累计']
  const productData = ref([
    { name: '氧化球团', spec: '自产', unit: '吨', daily: '0', monthly: '0' },
    {
      name: '酸性球团',
      spec: '自产',
      unit: '吨',
      daily: '0',
      monthly: '131,172.97',
    },
  ])

  // ---- 产品库存 ----
  const inventoryHeaders = ['产品名称', '规格', '类型', '单位', '当日库存']
  const inventoryData = ref([
    {
      name: '氧化球团',
      spec: '自产',
      type: '产品',
      unit: '吨',
      stock: '4,181',
    },
    {
      name: '酸性球团',
      spec: '自产',
      type: '产品',
      unit: '吨',
      stock: '9,239.66',
    },
    { name: '总计', spec: '', type: '', unit: '万', stock: '12,418.56' },
  ])

  // ---- 自动滚动 (requestAnimationFrame + smooth) ----
  const scrollRef1 = ref<HTMLElement>()
  const scrollRef2 = ref<HTMLElement>()
  let raf1 = 0
  let raf2 = 0
  let paused1 = false
  let paused2 = false

  function smoothScroll(el: HTMLElement | undefined, which: 1 | 2) {
    if (!el) return
    const isPaused = which === 1 ? paused1 : paused2

    if (!isPaused) {
      el.scrollTop += 0.5
      if (el.scrollTop >= el.scrollHeight - el.offsetHeight) {
        el.scrollTop = 0
      }
    }

    if (which === 1) {
      raf1 = requestAnimationFrame(() => smoothScroll(el, 1))
    } else {
      raf2 = requestAnimationFrame(() => smoothScroll(el, 2))
    }
  }

  function startScroll(which: 1 | 2) {
    const el = which === 1 ? scrollRef1.value : scrollRef2.value
    smoothScroll(el, which)
  }

  function pauseScroll(which: 1 | 2) {
    if (which === 1) paused1 = true
    else paused2 = true
  }

  function resumeScroll(which: 1 | 2) {
    if (which === 1) paused1 = false
    else paused2 = false
  }

  onMounted(() => {
    startScroll(1)
    startScroll(2)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf1)
    cancelAnimationFrame(raf2)
  })
</script>

<template>
  <div
    class="rpanel"
    :class="{ 'rpanel--open': isOpen }"
  >
    <!-- 展开/关闭把手 -->
    <div class="rpanel__handle">
      <img
        v-if="!isOpen"
        src="/3d-assets/fac/right-open.png"
        class="rpanel__handle-bg"
        alt=""
      />
      <img
        v-else
        src="/3d-assets/fac/right-close.png"
        class="rpanel__handle-bg"
        alt=""
      />
      <span
        class="rpanel__handle-text"
        @click="isOpen = !isOpen"
      >
        {{ isOpen ? '关闭' : '展开' }}
      </span>
    </div>

    <!-- 内容区 -->
    <div class="rpanel__body">
      <!-- 1. 能源消耗 -->
      <section class="rpanel__section">
        <div class="rpanel__section-head">
          <img
            src="/3d-assets/fac/info1.png"
            class="rpanel__head-bg"
            alt=""
          />
          <span class="rpanel__head-title">能源消耗</span>
        </div>
        <div class="rpanel__energy">
          <div
            v-for="(c, i) in energyCards"
            :key="i"
            class="energy-card"
          >
            <div class="energy-card__icon-wrap">
              <img
                :src="c.icon"
                class="energy-card__icon"
                alt=""
              />
            </div>
            <div class="energy-card__body">
              <div class="energy-card__label">{{ c.label }}</div>
              <div class="energy-card__row">
                <span class="energy-card__val">{{ c.daily }}</span>
                <span class="energy-card__unit">/日</span>
              </div>
              <div class="energy-card__row">
                <span class="energy-card__val">{{ c.monthly }}</span>
                <span class="energy-card__unit">/月</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 原辅料库存 -->
      <section class="rpanel__section">
        <div class="rpanel__section-head">
          <img
            src="/3d-assets/fac/info1.png"
            class="rpanel__head-bg"
            alt=""
          />
          <span class="rpanel__head-title">原辅料库存</span>
        </div>
        <div class="rpanel__table">
          <div class="rpanel__thead">
            <span
              v-for="h in materialHeaders"
              :key="h"
              >{{ h }}</span
            >
          </div>
          <div
            ref="scrollRef1"
            class="rpanel__tbody"
            @mouseenter="pauseScroll(1)"
            @mouseleave="resumeScroll(1)"
          >
            <div
              v-for="(row, i) in materialData"
              :key="i"
              class="rpanel__tr"
            >
              <span class="rpanel__td-name">{{ row.name }}</span>
              <span>{{ row.spec }}</span>
              <span>{{ row.type }}</span>
              <span class="rpanel__td-num">{{ row.stock }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 产品产量 -->
      <section class="rpanel__section">
        <div class="rpanel__section-head">
          <img
            src="/3d-assets/fac/info1.png"
            class="rpanel__head-bg"
            alt=""
          />
          <span class="rpanel__head-title">产品产量</span>
        </div>
        <div class="rpanel__table rpanel__table--5col">
          <div class="rpanel__thead rpanel__thead--5col">
            <span
              v-for="h in productHeaders"
              :key="h"
              >{{ h }}</span
            >
          </div>
          <div
            ref="scrollRef2"
            class="rpanel__tbody"
            @mouseenter="pauseScroll(2)"
            @mouseleave="resumeScroll(2)"
          >
            <div
              v-for="(row, i) in productData"
              :key="i"
              class="rpanel__tr rpanel__tr--5col"
            >
              <span class="rpanel__td-name">{{ row.name }}</span>
              <span>{{ row.spec }}</span>
              <span>{{ row.unit }}</span>
              <span class="rpanel__td-num">{{ row.daily }}</span>
              <span class="rpanel__td-num">{{ row.monthly }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 产品库存 -->
      <section class="rpanel__section">
        <div class="rpanel__section-head">
          <img
            src="/3d-assets/fac/info1.png"
            class="rpanel__head-bg"
            alt=""
          />
          <span class="rpanel__head-title">产品库存</span>
        </div>
        <div class="rpanel__table rpanel__table--5col">
          <div class="rpanel__thead rpanel__thead--5col">
            <span
              v-for="h in inventoryHeaders"
              :key="h"
              >{{ h }}</span
            >
          </div>
          <div class="rpanel__tbody">
            <div
              v-for="(row, i) in inventoryData"
              :key="i"
              class="rpanel__tr rpanel__tr--5col"
            >
              <span class="rpanel__td-name">{{ row.name }}</span>
              <span>{{ row.spec }}</span>
              <span>{{ row.type }}</span>
              <span>{{ row.unit }}</span>
              <span class="rpanel__td-num">{{ row.stock }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @function vh($px) {
    @return calc($px * 100vh / 1080);
  }

  .rpanel {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 15;
    width: 22%;
    height: 100%;
    transform: translateX(100%);
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    &--open {
      transform: translateX(0);
    }

    &__handle {
      position: absolute;
      top: 0;
      left: vh(-60);
      width: vh(60);
      height: 100%;

      &-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      &-text {
        position: absolute;
        top: 50%;
        left: vh(22);
        transform: translateY(-50%);
        writing-mode: vertical-rl;
        color: #fff;
        font-size: vh(14);
        cursor: pointer;
        letter-spacing: vh(4);

        &:hover {
          color: #8bebff;
        }
      }
    }

    &__body {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: vh(80) vh(10) vh(20) vh(10);
      display: flex;
      flex-direction: column;
      gap: vh(6);

      &::-webkit-scrollbar {
        width: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(100, 200, 255, 0.15);
        border-radius: 2px;
      }
    }

    &__section {
      background: url('/3d-assets/fac/info.png') center / 100% 100% no-repeat;
      min-height: vh(180);
      display: flex;
      flex-direction: column;
    }

    &__section-head {
      position: relative;
      height: vh(34);
      display: flex;
      align-items: center;
    }

    &__head-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    &__head-title {
      position: relative;
      z-index: 1;
      padding-left: vh(16);
      color: #8bebff;
      font-size: vh(15);
      font-weight: 600;
      letter-spacing: vh(2);
    }

    // ---- 能源消耗卡片 (重新设计) ----
    &__energy {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: vh(6);
      padding: vh(10) vh(8);
      flex: 1;
    }

    // ---- 表格 ----
    &__table {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: vh(2) vh(8);
      overflow: hidden;
      color: #bae7ff;
      font-size: vh(12);
    }

    &__thead {
      display: grid;
      grid-template-columns: 1.6fr 1.4fr 0.8fr 1fr;
      gap: vh(4);
      padding: vh(6) vh(4);
      color: rgba(180, 220, 255, 0.7);
      font-size: vh(12);
      font-weight: 600;
      border-bottom: 1px solid rgba(49, 239, 251, 0.15);

      &--5col {
        grid-template-columns: 1.4fr 0.8fr 0.6fr 0.8fr 1fr;
      }
    }

    &__tbody {
      flex: 1;
      overflow-y: auto;
      max-height: vh(130);
      scroll-behavior: auto;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__tr {
      display: grid;
      grid-template-columns: 1.6fr 1.4fr 0.8fr 1fr;
      gap: vh(4);
      padding: vh(5) vh(4);
      line-height: vh(20);
      border-bottom: 1px solid rgba(8, 50, 70, 0.6);
      transition: background 0.2s;

      &:nth-child(2n) {
        background: rgba(8, 33, 50, 0.6);
      }

      &:hover {
        background: linear-gradient(
          93deg,
          rgba(19, 95, 114, 0.6),
          rgba(12, 55, 72, 0.4),
          rgba(4, 24, 32, 0.3)
        );
      }

      &--5col {
        grid-template-columns: 1.4fr 0.8fr 0.6fr 0.8fr 1fr;
      }
    }

    &__td-name {
      color: #6dd2ff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__td-num {
      color: #31effb;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
  }

  // ---- 能源卡片组件 ----
  .energy-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: vh(4);
    padding: vh(6) vh(2);
    border-radius: vh(4);
    background: linear-gradient(
      180deg,
      rgba(10, 50, 80, 0.3),
      rgba(5, 25, 45, 0.15)
    );
    border: 1px solid rgba(49, 239, 251, 0.08);
    transition: all 0.3s;

    &:hover {
      border-color: rgba(49, 239, 251, 0.2);
      background: linear-gradient(
        180deg,
        rgba(10, 50, 80, 0.5),
        rgba(5, 25, 45, 0.25)
      );
    }

    &__icon-wrap {
      width: vh(44);
      height: vh(44);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(49, 239, 251, 0.3));
    }

    &__body {
      width: 100%;
      text-align: center;
    }

    &__label {
      font-size: vh(11);
      color: rgba(255, 255, 255, 0.55);
      margin-bottom: vh(4);
      line-height: 1.2;
    }

    &__row {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: vh(2);
      line-height: vh(18);
    }

    &__val {
      color: #31effb;
      font-size: vh(14);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    &__unit {
      color: rgba(255, 255, 255, 0.4);
      font-size: vh(10);
    }
  }
</style>
