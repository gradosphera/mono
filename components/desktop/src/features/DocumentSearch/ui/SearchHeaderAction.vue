<template lang="pug">
q-btn(
  flat
  dense
  no-caps
  icon='search'
  label='Поиск'
  @click='showSearch = true'
)

DocumentSearchDialog(v-model='showSearch')
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DocumentSearchDialog from './DocumentSearchDialog.vue'

const showSearch = ref(false)
</script>
