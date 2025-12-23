import { defineStore } from 'pinia'
import { getItem, setItem } from '@/hooks/useStorage'

const STORAGE_KEY = 'favorite-menus'

export interface FavoriteItemRef {
  path: string
}

export const s_favoritesStore = defineStore('favorites', {
  state: () => ({
    favorites:
      (getItem<string[]>(STORAGE_KEY) as string[] | null) ?? ([] as string[]),
  }),

  getters: {
    isFavorite: state => (path: string) => state.favorites.includes(path),
  },

  actions: {
    load() {
      const data = getItem<string[]>(STORAGE_KEY)
      this.favorites = (data as string[] | null) ?? []
    },

    persist() {
      setItem(STORAGE_KEY, this.favorites)
    },

    add(path: string) {
      if (!this.favorites.includes(path)) {
        this.favorites.push(path)
        this.persist()
      }
    },

    remove(path: string) {
      const idx = this.favorites.indexOf(path)
      if (idx !== -1) {
        this.favorites.splice(idx, 1)
        this.persist()
      }
    },

    toggle(path: string) {
      if (this.favorites.includes(path)) {
        this.remove(path)
      } else {
        this.add(path)
      }
    },
  },
})
