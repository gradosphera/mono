<script setup lang="ts">
import { ref, computed } from 'vue'
import PinIcon from 'src/assets/pin.svg'

const props = defineProps({
  long: {
    type: Number,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
})

const projection = ref('EPSG:4326')
const zoom = ref(18)
const rotation = ref(0)

const pinCenter = computed(() => {
  return [Number(props.long), Number(props.lat)]
})
</script>

<template lang="pug">
div.q-mt-lg
  ol-map(
    :load-tiles-while-animating="true"
    :load-tiles-while-interacting="true"
    style="height: 300px; border: 1px solid grey;"
  )
    ol-view(
      ref="view"
      :center="pinCenter"
      :enable-rotation="false"
      :zoom="zoom"
      :projection="projection"
      :rotation="rotation"
    )

    ol-tile-layer
      ol-source-osm
    ol-vector-layer
      ol-source-vector
        ol-feature
          ol-geom-point(v-if="pinCenter" :coordinates="pinCenter")
          ol-style
            ol-style-stroke(color="red" :width="2")
            ol-style-fill(color="rgba(255,255,255,0.1)")
            ol-style-icon(:src="PinIcon" :scale="1.5")

</template>
