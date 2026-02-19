<template lang="pug">
div.row
  div(v-for="extension in filteredExtensions" v-bind:key="extension.name").col-md-3.col-sm-6.col-xs-12
    ExtensionCard(:extension="extension")

</template>
<script lang="ts" setup>
import { useExtensionStore } from 'src/entities/Extension/model';
import { useSystemStore } from 'src/entities/System/model';
import { onMounted, computed } from 'vue';
import { ExtensionCard } from 'src/widgets/ExtensionCard';

const extStore = useExtensionStore()
const systemStore = useSystemStore()

const filteredExtensions = computed(() => {
  // Временно: скрываем расширение 'capital' для всех кооперативов кроме 'voskhod'
  // TODO: убрать фильтрацию потом, когда станет доступно для всех
  return extStore.extensions.filter((extension) => 
    extension.name !== 'capital' || systemStore.info.coopname === 'voskhod'
  )
})

onMounted(async () => {
  extStore.loadExtensions()
})

</script>
