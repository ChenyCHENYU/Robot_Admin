<template>
  <div class="h-full p-4">
    <iframe
      class="wh-full"
      :src="frameSrc"
      width="100%"
      height="800px"
    ></iframe>
  </div>
</template>

<script lang="ts" setup>
  const router = useRouter()

  // 获得iframe的src
  const frameSrc = computed<string>(() => {
    const current = router.currentRoute.value
    return (current.meta.link = current.meta.link || '') as string
  })
</script>
