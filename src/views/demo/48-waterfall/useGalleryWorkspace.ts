/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @Description: 素材筛选、分批展示和详情预览
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { WaterFallExpose } from '@robot-admin/naive-ui-components/C_WaterFall'
import {
  GALLERY_ITEMS,
  COLLECTION_OPTIONS,
  createGalleryCollection,
  type GalleryItem,
} from './data'

/** 页面只维护素材筛选、预览和手动分页；布局与可见区计算交给组件。 */
export function useGalleryWorkspace() {
  const galleryRef = ref<WaterFallExpose | null>(null)
  const category = ref('全部素材')
  const search = ref('')
  const columns = ref(0)
  const featured = COLLECTION_OPTIONS[0]
  const collectionSize = ref(featured.value)
  const collectionOption = computed(
    () =>
      COLLECTION_OPTIONS.find(
        option => option.value === collectionSize.value
      ) ?? featured
  )
  const collection = computed(() =>
    collectionOption.value === featured
      ? GALLERY_ITEMS
      : createGalleryCollection(collectionOption.value.value)
  )
  const limit = ref(featured.pageSize)
  const selected = shallowRef<GalleryItem | null>(null)
  const showItem = ref(false)
  const filteredItems = computed(() =>
    collection.value.filter(
      item =>
        (category.value === '全部素材' || item.category === category.value) &&
        item.title.includes(search.value.trim())
    )
  )
  const visibleItems = computed(() => filteredItems.value.slice(0, limit.value))
  const openItem = (item: GalleryItem) => {
    selected.value = item
    showItem.value = true
  }
  const loadMore = () => {
    limit.value += collectionOption.value.pageSize
  }
  const download = () => {
    if (!selected.value) return
    const anchor = document.createElement('a')
    anchor.href = selected.value.src
    anchor.download = `${selected.value.id}.svg`
    anchor.click()
  }
  watch([category, search, collectionSize], () => {
    limit.value = collectionOption.value.pageSize
  })
  return {
    galleryRef,
    category,
    search,
    columns,
    collectionSize,
    limit,
    selected,
    showItem,
    filteredItems,
    visibleItems,
    openItem,
    download,
    loadMore,
  }
}
