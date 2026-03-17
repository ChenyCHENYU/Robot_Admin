<script setup lang="ts">
  import type { DayNightMode, SceneLevel } from '../engine'

  defineProps<{
    /** 日夜模式 */
    dayNight: DayNightMode
    /** 场景层级 */
    sceneLevel: SceneLevel
    /** 当前下钻建筑名 */
    currentBuilding: string
    /** 当前能源模式 */
    energyMode: string
  }>()

  const emit = defineEmits<{
    toggleDayNight: []
    resetCamera: []
    returnOverview: []
    showEnergy: [type: string]
  }>()

  /** 能源选项 */
  const energyTypes = [
    { key: '总览', icon: '🏭', label: '能源总览' },
    { key: '电', icon: '⚡', label: '电力' },
    { key: '水', icon: '💧', label: '供水' },
    { key: '天然气', icon: '🔥', label: '天然气' },
    { key: '压缩空气', icon: '💨', label: '压缩空气' },
    { key: '氮气', icon: '🧪', label: '氮气' },
  ]
</script>

<template>
  <div class="ctrl">
    <!-- 返回按钮(下钻模式) -->
    <button
      v-if="sceneLevel === 2"
      class="ctrl__back"
      @click="emit('returnOverview')"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span>返回总览</span>
    </button>

    <!-- 当前下钻提示 -->
    <div
      v-if="sceneLevel === 2"
      class="ctrl__level-tag"
    >
      {{ currentBuilding }}
    </div>

    <!-- 总览工具栏 -->
    <template v-if="sceneLevel === 1">
      <!-- 日夜切换 -->
      <button
        class="ctrl__pill"
        @click="emit('toggleDayNight')"
      >
        <span
          class="ctrl__pill-icon"
          :class="{ 'ctrl__pill-icon--night': dayNight === 'night' }"
        >
          {{ dayNight === 'day' ? '☀️' : '🌙' }}
        </span>
        <span>{{ dayNight === 'day' ? '日间' : '夜间' }}</span>
      </button>

      <!-- 重置视角 -->
      <button
        class="ctrl__pill"
        @click="emit('resetCamera')"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span>重置视角</span>
      </button>

      <!-- 能源管网 -->
      <div class="ctrl__energy">
        <div class="ctrl__section-label">能源管网</div>
        <div class="ctrl__energy-grid">
          <button
            v-for="e in energyTypes"
            :key="e.key"
            class="ctrl__energy-btn"
            :class="{ 'ctrl__energy-btn--active': energyMode === e.key }"
            @click="emit('showEnergy', e.key)"
          >
            <span class="ctrl__energy-icon">{{ e.icon }}</span>
            <span>{{ e.label }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .ctrl {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
    user-select: none;

    &__back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(0, 180, 255, 0.2);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 180, 255, 0.5);
      border-radius: 8px;
      color: #8bebff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s;

      &:hover {
        background: rgba(0, 180, 255, 0.35);
        box-shadow: 0 0 20px rgba(0, 180, 255, 0.3);
      }
    }

    &__level-tag {
      padding: 6px 14px;
      background: rgba(0, 20, 50, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(100, 200, 255, 0.25);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    &__pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: rgba(0, 20, 50, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(100, 200, 255, 0.2);
      border-radius: 8px;
      color: #d0eeff;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.25s;

      svg {
        opacity: 0.7;
      }

      &:hover {
        background: rgba(0, 40, 80, 0.85);
        border-color: rgba(100, 200, 255, 0.5);

        svg {
          opacity: 1;
        }
      }
    }

    &__pill-icon {
      font-size: 14px;
      transition: transform 0.4s;

      &--night {
        transform: rotate(180deg);
      }
    }

    &__energy {
      margin-top: 4px;
      background: rgba(0, 20, 50, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(100, 200, 255, 0.2);
      border-radius: 8px;
      padding: 10px;
    }

    &__section-label {
      font-size: 11px;
      color: rgba(139, 235, 255, 0.6);
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    &__energy-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__energy-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(100, 200, 255, 0.08);
        color: #fff;
      }

      &--active {
        background: rgba(0, 180, 255, 0.15);
        border-color: rgba(0, 180, 255, 0.4);
        color: #8bebff;
        font-weight: 600;
      }
    }

    &__energy-icon {
      font-size: 14px;
      width: 20px;
      text-align: center;
    }
  }
</style>
