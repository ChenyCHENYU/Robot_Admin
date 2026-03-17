<script setup lang="ts">
  defineProps<{
    progress: number
    text: string
  }>()
</script>

<template>
  <div class="scene-loading">
    <div class="scene-loading__card">
      <!-- 圆环进度 -->
      <div class="scene-loading__ring">
        <svg viewBox="0 0 100 100">
          <circle
            class="track"
            cx="50"
            cy="50"
            r="42"
          />
          <circle
            class="fill"
            cx="50"
            cy="50"
            r="42"
            :style="{ strokeDashoffset: 264 - (264 * progress) / 100 }"
          />
        </svg>
        <span class="scene-loading__percent">{{ progress }}%</span>
      </div>
      <!-- 进度条 -->
      <div class="scene-loading__bar">
        <div
          class="scene-loading__bar-fill"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <span class="scene-loading__text">{{ text }}...</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .scene-loading {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at center, #0a1628 0%, #040b14 100%);

    &__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    &__ring {
      position: relative;
      width: 120px;
      height: 120px;

      svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .track {
        fill: none;
        stroke: rgba(100, 200, 255, 0.1);
        stroke-width: 3;
      }

      .fill {
        fill: none;
        stroke: #31effb;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-dasharray: 264;
        transition: stroke-dashoffset 0.3s ease;
        filter: drop-shadow(0 0 8px rgba(49, 239, 251, 0.7));
      }
    }

    &__percent {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0 10px rgba(49, 239, 251, 0.4);
    }

    &__bar {
      width: 280px;
      height: 4px;
      background: rgba(100, 200, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;

      &-fill {
        height: 100%;
        background: linear-gradient(90deg, #31effb, #8bebff);
        border-radius: 2px;
        transition: width 0.3s ease;
        box-shadow:
          0 0 10px rgba(49, 239, 251, 0.5),
          0 0 20px rgba(49, 239, 251, 0.2);
      }
    }

    &__text {
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
      letter-spacing: 3px;
    }
  }
</style>
