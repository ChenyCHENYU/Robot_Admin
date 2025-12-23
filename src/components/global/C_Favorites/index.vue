<template>
  <div class="favorites-grid-container">
    <div
      v-if="items.length === 0"
      class="empty-favorites"
    >
      <div class="empty-icon">
        <i class="i-ri:star-line"></i>
      </div>
      <div class="empty-text">暂无收藏</div>
      <div class="empty-desc">快去收藏你喜欢的菜单吧~</div>
    </div>

    <div
      v-else
      class="favorites-grid"
    >
      <div
        v-for="item in items"
        :key="item.path"
        class="favorite-card"
        @click="handleOpen(item)"
      >
        <div class="card-icon">
          <i :class="item.icon || 'i-ri:file-text-line'"></i>
        </div>
        <div class="card-name">{{ item.name }}</div>
        <div
          class="card-star"
          @click.stop="handleToggle(item)"
        >
          <i class="i-ri:star-fill"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { s_permissionStore } from '@/stores/permission'
  import { s_favoritesStore } from '@/stores/favorites'
  import type { FavoriteItem } from './data'

  defineOptions({ name: 'C_Favorites' })

  const router = useRouter()
  const favStore = s_favoritesStore()
  const permissionStore = s_permissionStore()

  // 从所有菜单中找到对应的菜单项（递归）
  const findMenuItemByPath = (menus: any[], path: string): any => {
    for (const menu of menus) {
      if (menu.path === path) return menu
      if (menu.children) {
        const found = findMenuItemByPath(menu.children, path)
        if (found) return found
      }
    }
    return null
  }

  // 收藏列表（从 store 动态计算）
  const items = computed<FavoriteItem[]>(() => {
    const allMenus = permissionStore.showMenuListGet || []
    return favStore.favorites
      .map(path => {
        const menu = findMenuItemByPath(allMenus, path)
        if (menu) {
          return {
            path: menu.path,
            name: menu.meta?.title || menu.label || menu.name,
            icon: menu.meta?.icon || menu.icon,
          } as FavoriteItem
        }
        return null
      })
      .filter((i): i is FavoriteItem => i !== null)
  })

  // 打开菜单
  const handleOpen = async (item: FavoriteItem) => {
    if (item.path) {
      await router.push(item.path)
    }
  }

  // 切换收藏状态
  const handleToggle = (item: FavoriteItem) => {
    favStore.toggle(item.path)
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
