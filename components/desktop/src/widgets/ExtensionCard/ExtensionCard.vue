<template lang="pug">
div.q-pa-md
  q-card(flat bordered @click="open").hover-card.q-pa-md
    p.text-h6.no-margin {{extension.title}}

    div
      q-chip(outline  v-for="tag in extension.tags" v-bind:key="tag" dense size="sm") {{tag}}

    q-img(v-if="extension.image" :src="extension.image")


    p.q-mt-md {{extension.description}}
    div.flex.justify-between.items-center
      div
        q-chip(square dense size="md" color="green" outline v-if="extension.is_installed && extension.is_available").q-ml-sm установлено

      div
        q-btn(dense size="sm" v-if="extension.is_available" flat @click="open")
          span подробнее
          q-icon(name="fa fa-arrow-right").q-ml-sm

        q-chip(size="md" dense color="orange" v-if="!extension.is_available" outline) в разработке

</template>
<script lang="ts" setup>
import type { IExtension } from 'src/entities/Extension/model/types';
import { useRouter } from 'vue-router';

const props = defineProps({
  extension: {
    required: true,
    type: Object as () => IExtension
  }
})


const router = useRouter()

const open = () => {
  if (props.extension.is_available)
    router.push({name: 'one-extension', params: {name: props.extension.name}})
}
</script>
