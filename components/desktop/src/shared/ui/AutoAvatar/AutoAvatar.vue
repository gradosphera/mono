<template lang="pug">
.auto-avatar(v-if='ava', :style='rootStyle')
  q-img.auto-avatar__img(:src='ava')
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { createAvatar } from '@dicebear/core'
import { rings } from '@dicebear/collection'

const ava = ref<string>()

const props = withDefaults(
  defineProps<{
    username: string
    /** Размер плитки в пикселях. */
    size?: number
    /** Скругление углов (CSS-значение). */
    radius?: string
    /** Фон плитки под аватаром. */
    background?: string
    /** Палитра цветов колец — DiceBear выбирает детерминированно по seed. */
    ringColor?: string[]
  }>(),
  {
    size: 100,
    radius: '50%',
    background: 'black',
    ringColor: () => ['4db6ac'],
  },
)

const username = computed(() => props.username)

const rootStyle = computed(() => ({
  width: `${props.size}px`,
  background: props.background,
  borderRadius: props.radius,
}))

function render() {
  if (!username.value) return
  const avatar = createAvatar(rings, {
    seed: username.value,
    ringColor: props.ringColor,
  })
  const blob = new Blob([avatar.toString()], { type: 'image/svg+xml' })
  ava.value = URL.createObjectURL(blob)
}

onMounted(render)
watch(username, render)
</script>

<style scoped lang="scss">
.auto-avatar {
  overflow: hidden;
  line-height: 0;
}
.auto-avatar__img {
  width: 100%;
  border-radius: inherit;
}
</style>
