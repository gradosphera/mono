<script setup lang="ts">
  import { constructImageSrc } from 'src/shared/api'
  import { ref, computed } from 'vue'
  import type { PropType } from 'vue'

  const props = defineProps({
    images: {
      type: Array as PropType<string[]>,
      required: true,
    },
    noRounded: {
      type: Boolean,
      requred: false,
      default: false,
    },
  })

  const computedImages = computed(() => {
    return props.images.map((image) => constructImageSrc(image))
  })

  const showNavigation = computed(() => computedImages.value.length > 1)

  const slide = ref(0)
  const fullscreen = ref(false)
</script>
<template lang="pug">
div
  q-carousel(
    v-model="slide"
    v-model:fullscreen="fullscreen"
    animated
    :arrows="showNavigation"
    :navigation="showNavigation"
    autoplay
    style="border: 1px solid grey;"
    infinite
    prev-icon=""
    next-icon=""
    :height="'350px'"
    :class="!noRounded && 'rounded-borders'"
  )
    template(#navigation-icon="{ active, btnProps, onClick }")
      q-btn(
        size="10px"
        :icon="btnProps.icon"
        :color="active ? 'primary' : 'white'"
        flat
        round
        dense
        @click="onClick"
      )

    q-carousel-slide(v-for="(img, i) in computedImages" :key="i" :name="i" :img-src="img" @click="fullscreen = !fullscreen").cursor-pointer

    template(#control)
      q-carousel-control(position="top-right" :offset="[18, 18]")
        q-btn(
          size="sm"
          push
          round
          dense
          color="white"
          text-color="primary"
          :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="fullscreen = !fullscreen"
        )
</template>
