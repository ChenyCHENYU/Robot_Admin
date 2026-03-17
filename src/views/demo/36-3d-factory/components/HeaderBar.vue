<script setup lang="ts">
  defineProps<{
    /** 当前位置名称 */
    locationName: string
    /** 是否可以返回(二级场景) */
    canGoBack: boolean
    /** 日间模式 */
    isDay: boolean
  }>()

  const emit = defineEmits<{
    goBack: []
    toggleDayNight: []
  }>()
</script>

<template>
  <div class="hdr">
    <!-- 左侧: 返回 + 位置名 -->
    <div class="hdr__left">
      <button
        v-if="canGoBack"
        class="hdr__back"
        @click="emit('goBack')"
      >
        返回
      </button>
      <div class="hdr__loc">{{ locationName }}</div>
    </div>

    <!-- 中间: 标题背景图 -->
    <div class="hdr__center">
      <img
        src="/3d-assets/fac/bg-header.png"
        class="hdr__banner"
        alt=""
      />
      <span class="hdr__title">数字工厂驾驶舱</span>
    </div>

    <!-- 右侧: 日夜切换 -->
    <div class="hdr__right">
      <button
        class="hdr__day-night"
        @click="emit('toggleDayNight')"
      >
        <img
          v-if="isDay"
          src="/3d-assets/fac/day-btn.png"
          alt="日间"
        />
        <img
          v-else
          src="/3d-assets/fac/night-btn.png"
          alt="夜间"
        />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @function vh($px) {
    @return calc($px * 100vh / 1080);
  }

  .hdr {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    height: vh(86);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    pointer-events: none;

    &__left {
      display: flex;
      align-items: center;
      gap: vh(8);
      padding: vh(12) 0 0 vh(40);
      pointer-events: auto;
      z-index: 2;
    }

    &__back {
      min-width: vh(100);
      height: vh(48);
      text-align: center;
      line-height: vh(24);
      padding: vh(14);
      background: url('/3d-assets/fac/fan.png') 100% 100% no-repeat;
      background-size: 100% 100%;
      color: #fff;
      font-size: vh(14);
      border: none;
      cursor: pointer;

      &:hover {
        filter: brightness(1.3);
      }
    }

    &__loc {
      min-width: vh(100);
      height: vh(48);
      text-align: center;
      line-height: vh(24);
      padding: vh(14);
      background: url('/3d-assets/fac/name.png') 100% 100% no-repeat;
      background-size: 100% 100%;
      color: #fff;
      font-size: vh(14);
    }

    &__center {
      position: absolute;
      top: vh(-5);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    &__banner {
      width: vh(1080);
      height: vh(86);
    }

    &__title {
      position: absolute;
      top: vh(14);
      color: #fff;
      font-size: vh(28);
      font-weight: 700;
      letter-spacing: vh(6);
      text-shadow:
        0 0 12px rgba(100, 200, 255, 0.6),
        0 2px 4px rgba(0, 0, 0, 0.5);
    }

    &__right {
      display: flex;
      align-items: center;
      gap: vh(12);
      padding: vh(20) vh(50) 0 0;
      pointer-events: auto;
      z-index: 2;
    }

    &__day-night {
      width: vh(60);
      height: vh(24);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;

      img {
        width: 100%;
        height: 100%;
      }

      &:hover {
        filter: brightness(1.2);
      }
    }
  }
</style>
