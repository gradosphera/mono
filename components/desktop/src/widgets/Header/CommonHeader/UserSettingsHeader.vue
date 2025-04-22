<!-- UserSettingsHeader.vue -->
<template lang="pug">
q-header(bordered).flex.bg-gradient-dark
  q-toolbar
    q-btn(flat icon="fas fa-chevron-left" stretch @click="open('index')")
    q-tabs(
      dense
      switch-indicator
      inline-label
      align="justify"
      active-class="bg-teal"
      active-bg-color="teal"
      active-color="white"
      indicator-color="secondary"
      class="header-tab-container"
    )
      q-route-tab(name="Реквизиты" label="Реквизиты" :to="{name: 'user-payment-methods'}" )
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import './HeaderStyles.scss'

const router = useRouter()

const open = (name: string) => {
  router.push({name})
}
</script>
