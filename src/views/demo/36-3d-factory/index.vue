<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useFactoryScene } from './composables/useFactoryScene'
  import SceneLoading from './components/SceneLoading.vue'
  import HeaderBar from './components/HeaderBar.vue'
  import SideMenu from './components/SideMenu.vue'
  import RightPanel from './components/RightPanel.vue'

  const sceneRef = ref<HTMLElement>()
  const activeMenu = ref('总览')

  const {
    engine,
    loading,
    progress,
    progressText,
    dayNight,
    sceneLevel,
    currentBuilding,
    energyMode,
    initScene,
    drillDown,
    returnToOverview,
    toggleDayNight,
    showEnergy,
    hideEnergy,
  } = useFactoryScene()

  onMounted(async () => {
    if (!sceneRef.value) return
    await initScene(sceneRef.value)

    engine.value?.on('labelClick', (data: { name: string }) => {
      drillDown(data.name)
    })
  })

  /** 左侧菜单切换 */
  function handleSelectMenu(name: string) {
    // 如果在二级, 先返回总览
    if (sceneLevel.value === 2) {
      returnToOverview()
    }

    // 切能源模式
    if (name === '能源') {
      showEnergy('总览')
    } else {
      hideEnergy()
    }
  }

  /** 能源子类型选择 */
  function handleEnergyType(type: string) {
    showEnergy(type)
  }

  /** 返回总览 */
  function handleGoBack() {
    returnToOverview()
    activeMenu.value = '总览'
  }

  /** 位置名称 */
  function locationName(): string {
    if (sceneLevel.value === 2) return currentBuilding.value
    return '厂区'
  }
</script>

<template>
  <div class="factory-3d">
    <!-- 3D 场景容器 -->
    <div
      ref="sceneRef"
      class="factory-3d__scene"
    />

    <!-- 边框遮罩(与原始 bg.png 一致) -->
    <div class="factory-3d__frame" />

    <!-- CSS2D 标签容器 -->
    <div
      id="cssrender"
      class="factory-3d__css2d"
    />

    <!-- 加载遮罩 -->
    <SceneLoading
      v-if="loading"
      :progress="progress"
      :text="progressText"
    />

    <template v-if="!loading">
      <!-- 顶部导航 -->
      <HeaderBar
        :location-name="locationName()"
        :can-go-back="sceneLevel === 2"
        :is-day="dayNight === 'day'"
        @go-back="handleGoBack"
        @toggle-day-night="toggleDayNight"
      />

      <!-- 左侧菜单 -->
      <SideMenu
        v-model:active-menu="activeMenu"
        :scene-level="sceneLevel"
        :energy-mode="energyMode"
        @select-menu="handleSelectMenu"
        @select-energy-type="handleEnergyType"
      />

      <!-- 右侧数据面板 -->
      <RightPanel v-if="sceneLevel === 1" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .factory-3d {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: #060e1a;

    &__scene {
      position: absolute;
      inset: 0;
    }

    &__frame {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: url('/3d-assets/fac/bg.png') center / 100% 100% no-repeat;
      z-index: 10;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(49, 239, 251, 0.02) 50%,
          transparent 100%
        );
        background-size: 100% 4px;
        animation: scanline 8s linear infinite;
        opacity: 0.3;
      }
    }

    &__css2d {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 5;
    }
  }

  @keyframes scanline {
    0% {
      background-position: 0 -100vh;
    }

    100% {
      background-position: 0 100vh;
    }
  }
</style>

<!-- 全局标签样式 —— CSS2DObject 渲染在 document 级别 -->
<style lang="scss">
  /* ====== 建筑标签(总览模式) ====== */
  .building-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-50%);
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.4));

    &__tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 16px;
      background: linear-gradient(
        135deg,
        rgba(10, 40, 70, 0.85),
        rgba(8, 28, 50, 0.75)
      );
      border: 1px solid rgba(100, 200, 255, 0.25);
      border-radius: 4px;
      backdrop-filter: blur(8px);
      color: rgba(200, 230, 255, 0.85);
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      min-height: 28px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 2px 12px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(100, 200, 255, 0.08);

      &--drill {
        cursor: pointer;
        pointer-events: auto;
        background: linear-gradient(
          135deg,
          rgba(10, 60, 100, 0.9),
          rgba(5, 35, 65, 0.85)
        );
        border-color: rgba(49, 239, 251, 0.45);
        color: #e0f6ff;
        box-shadow:
          0 0 16px rgba(49, 239, 251, 0.15),
          0 2px 12px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(100, 200, 255, 0.15);

        &:hover {
          border-color: rgba(49, 239, 251, 0.7);
          background: linear-gradient(
            135deg,
            rgba(15, 80, 130, 0.95),
            rgba(8, 50, 90, 0.9)
          );
          color: #fff;
          box-shadow:
            0 0 24px rgba(49, 239, 251, 0.3),
            0 4px 20px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(100, 200, 255, 0.2);
          transform: translateY(-2px);

          .building-label__drill-icon {
            opacity: 1;
            transform: translateX(2px);
          }
        }
      }
    }

    &__text {
      letter-spacing: 1px;
    }

    &__drill-icon {
      font-size: 8px;
      color: #31effb;
      opacity: 0.6;
      transition: all 0.3s;
    }

    &__stem {
      width: 1px;
      height: 32px;
      background: linear-gradient(
        to bottom,
        rgba(100, 200, 255, 0.5),
        rgba(100, 200, 255, 0.08)
      );

      &--drill {
        height: 36px;
        width: 2px;
        background: linear-gradient(
          to bottom,
          rgba(49, 239, 251, 0.7),
          rgba(49, 239, 251, 0.05)
        );
        box-shadow: 0 0 6px rgba(49, 239, 251, 0.3);
      }
    }

    &__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(100, 200, 255, 0.7);
      box-shadow: 0 0 8px rgba(100, 200, 255, 0.5);
      animation: label-dot-pulse 2.5s ease-in-out infinite;
      position: relative;

      &--drill {
        width: 8px;
        height: 8px;
        background: #31effb;
        box-shadow: 0 0 12px rgba(49, 239, 251, 0.7);
        animation: label-dot-pulse-drill 2s ease-in-out infinite;
      }
    }

    &__ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 22px;
      height: 22px;
      margin: -11px 0 0 -11px;
      border-radius: 50%;
      border: 1px solid rgba(49, 239, 251, 0.4);
      animation: label-ring-expand 2.5s ease-out infinite;
    }
  }

  @keyframes label-dot-pulse {
    0%,
    100% {
      box-shadow: 0 0 6px rgba(100, 200, 255, 0.4);
    }

    50% {
      box-shadow: 0 0 12px rgba(100, 200, 255, 0.7);
    }
  }

  @keyframes label-dot-pulse-drill {
    0%,
    100% {
      box-shadow: 0 0 8px rgba(49, 239, 251, 0.5);
    }

    50% {
      box-shadow: 0 0 20px rgba(49, 239, 251, 0.9);
    }
  }

  @keyframes label-ring-expand {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }

    100% {
      transform: scale(1.8);
      opacity: 0;
    }
  }

  /* ====== 事件标签(二级数据) ====== */
  .factory-label {
    &__content {
      background: linear-gradient(
        135deg,
        rgba(0, 25, 60, 0.92),
        rgba(0, 15, 40, 0.85)
      );
      border: 1px solid rgba(49, 239, 251, 0.3);
      border-radius: 6px;
      padding: 10px 16px;
      color: #e0f4ff;
      font-size: 12px;
      backdrop-filter: blur(10px);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(100, 200, 255, 0.1);

      &:hover {
        border-color: rgba(49, 239, 251, 0.6);
        box-shadow:
          0 0 20px rgba(49, 239, 251, 0.2),
          0 4px 24px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(100, 200, 255, 0.15);
        transform: translateY(-2px);
      }

      h3 {
        margin: 0 0 6px;
        font-size: 13px;
        font-weight: 600;
        color: #31effb;
        letter-spacing: 0.5px;
      }
    }

    &__pm {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      line-height: 1.9;

      .num {
        color: #31effb;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
    }
  }
</style>
