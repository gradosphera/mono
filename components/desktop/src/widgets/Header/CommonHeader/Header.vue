<!-- Header.vue -->
<template lang="pug">
div
  MainHeader(
    v-if="!matched('cooperative-settings') && !matched('user-settings') && !matched('extstore')"
    :showDrawer="showDrawer"
    @toggle-left-drawer="emitToggleLeftDrawer"
  )
  UserSettingsHeader(v-if="matched('user-settings')")
  CooperativeSettingsHeader(v-if="matched('cooperative-settings')")
  ExtstoreHeader(v-if="matched('extstore')")
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import MainHeader from './MainHeader.vue'
import UserSettingsHeader from './UserSettingsHeader.vue'
import CooperativeSettingsHeader from './CooperativeSettingsHeader.vue'
import ExtstoreHeader from './ExtstoreHeader.vue'
import './HeaderStyles.scss'

defineProps({
  showDrawer: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle-left-drawer'])
const route = useRoute()

const matched = (what: string) => {
  return route.matched.find(el => el.name === what)
}

const emitToggleLeftDrawer = () => {
  emit('toggle-left-drawer')
}
</script>
