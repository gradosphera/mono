<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import config from 'src/app/config'

const emit = defineEmits(['selectImage', 'removeImage'])

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  showFullScreen: {
    type: Boolean,
    required: false,
    default: false,
  },
  showRemove: {
    type: Boolean,
    required: false,
    default: false,
  },
  noRounded: {
    type: Boolean,
    requred: false,
    default: false,
  },
})

const computedImages = computed(() => {
  return props.images.map((image: unknown) => {
    const imageUrl = image as string;
    if (imageUrl.startsWith('https://')) {
      return imageUrl; // Изображение уже содержит HTTPS, оставляем его как есть
    } else {
      return config.storageUrl + imageUrl; // Иначе, добавляем config.storageUrl
    }
  })
})

const showThumbnails = computed(() => computedImages.value.length > 1)

const slide = ref(0)
const fullscreen = ref(false)

const select = (i: number | string) => {
  emit('selectImage', props.images[Number(i)])
}

const remove = () => {
  emit('removeImage', slide.value)
  nextTick()
  slide.value = 0
}
</script>
<template lang="pug">
div
  q-carousel(
    v-model="slide"
    v-model:fullscreen="fullscreen"
    animated
    :arrows="showThumbnails"
    style="border: 1px solid grey;"
    infinite
    :thumbnails="showThumbnails"
    prev-icon=""
    next-icon=""
    :height="'350px'"
    :class="!noRounded && 'rounded-borders'"
    @update:model-value="select"
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

    q-carousel-slide(v-for="(img, i) in computedImages" :key="i" :name="i" :img-src="img")

    template(#control)
      q-carousel-control(position="top-right" :offset="[18, 18]")
        span(v-if="showThumbnails").rounded.bg-grey-8.q-pa-xs.q-mr-sm главное изображение
        q-btn(
          size="sm"
          push
          round
          dense
          color="white"
          text-color="primary"
          icon="close"
          @click="remove"
        )

</template>
<style>
.q-carousel .q-carousel__thumbnail {
  height: 125px !important;
}
</style>
src/app/config
