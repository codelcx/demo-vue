<template>
  <div ref="waterMark" class="water-mark"></div>
</template>

<script setup lang="ts">
import { useWatermark } from './hook'

const waterMark = ref<HTMLElement | null>(null)
const { setWatermark } = useWatermark(waterMark.value)
setWatermark('watermark')
</script>

<style scoped lang="scss">
.water-mark {
  width: 100vw;
  height: 100vh;
}
</style>
