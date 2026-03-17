<script setup lang="ts">
  import type { SceneLevel } from '../engine'

  defineProps<{
    sceneLevel: SceneLevel
    energyMode: string
  }>()

  const emit = defineEmits<{
    selectMenu: [name: string]
    selectEnergyType: [type: string]
  }>()

  interface MenuItem {
    name: string
    icon: string
    energyTypes?: string[]
  }

  const menus: MenuItem[] = [
    { name: '总览', icon: '◎' },
    { name: '生产', icon: '⚙' },
    { name: '仓储', icon: '▤' },
    { name: '无人值守', icon: '◈' },
    {
      name: '能源',
      icon: '⚡',
      energyTypes: ['总览', '电', '水', '天然气', '压缩空气', '氮气'],
    },
  ]

  const activeMenu = defineModel<string>('activeMenu', { default: '总览' })

  function selectMenu(item: MenuItem) {
    activeMenu.value = item.name
    emit('selectMenu', item.name)
  }
</script>

<template>
  <div
    v-if="sceneLevel === 1"
    class="sidebar"
  >
    <!-- 主菜单 -->
    <div
      v-for="item in menus"
      :key="item.name"
      class="sidebar__item"
      :class="{ 'sidebar__item--active': activeMenu === item.name }"
      @click="selectMenu(item)"
    >
      <div class="sidebar__icon-wrap">
        <img
          :src="
            activeMenu === item.name
              ? '/3d-assets/fac/check.png'
              : '/3d-assets/fac/no-check.png'
          "
          class="sidebar__bg"
          alt=""
        />
        <span class="sidebar__icon">{{ item.icon }}</span>
      </div>
      <span
        class="sidebar__label"
        :class="{ 'sidebar__label--active': activeMenu === item.name }"
      >
        {{ item.name }}
      </span>
    </div>

    <!-- 能源子选项(底部栏) -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div
          v-if="
            activeMenu === '能源' &&
            menus.find(m => m.name === '能源')?.energyTypes
          "
          class="energy-bar"
        >
          <div
            v-for="t in menus.find(m => m.name === '能源')?.energyTypes"
            :key="t"
            class="energy-bar__item"
            :class="{ 'energy-bar__item--active': energyMode === t }"
            @click="emit('selectEnergyType', t)"
          >
            <span>{{ t }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
  @function vh($px) {
    @return calc($px * 100vh / 1080);
  }

  .sidebar {
    position: absolute;
    top: vh(100);
    left: vh(24);
    z-index: 15;
    display: flex;
    flex-direction: column;
    gap: vh(16);
    user-select: none;

    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }
    }

    &__icon-wrap {
      position: relative;
      width: vh(80);
      height: vh(80);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    &__icon {
      position: relative;
      z-index: 1;
      font-size: vh(24);
      color: #8bebff;
      filter: drop-shadow(0 0 6px rgba(100, 200, 255, 0.5));
      font-style: normal;
    }

    &__label {
      margin-top: vh(-4);
      font-size: vh(12);
      color: rgba(255, 255, 255, 0.75);
      text-align: center;
      transition: color 0.2s;
      letter-spacing: 0.5px;

      &--active {
        color: #ffc948;
        text-shadow: 0 0 8px rgba(255, 201, 72, 0.4);
      }
    }
  }

  /* 底部能源类型选择条 */
  .energy-bar {
    position: fixed;
    bottom: vh(20);
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: vh(8);
    padding: vh(8) vh(16);
    background: url('/3d-assets/fac/bg-footer.png') center / contain no-repeat;
    min-width: vh(600);
    height: vh(50);

    &__item {
      width: vh(80);
      height: vh(80);
      margin-top: vh(-48);
      display: flex;
      align-items: center;
      justify-content: center;
      background: url('/3d-assets/fac/bg-footer1.png') center / contain
        no-repeat;
      color: #fff;
      font-size: vh(14);
      cursor: pointer;
      transition: all 0.3s;

      span {
        line-height: vh(16);
        padding: vh(32) 0;
      }

      &:hover {
        margin-top: vh(-60);
        filter: brightness(1.2);
      }

      &--active {
        margin-top: vh(-72);
        color: #feb504;
        filter: brightness(1.3);
      }
    }
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.4s ease;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(40px);
  }
</style>
