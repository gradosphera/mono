<!-- ExtstoreHeader.vue -->
<template lang="pug">
q-header(bordered).bg-gradient-dark
  q-toolbar
    q-btn(flat icon="fas fa-chevron-left" stretch @click="backFromAppstore")
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
      q-route-tab(name="Все приложения" label="Все приложения" :to="{name: 'extstore-showcase'}" )
      q-route-tab(name="Установленные" label="Установленные" :to="{name: 'appstore-installed'}" )
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import './HeaderStyles.scss'

const router = useRouter()
const route = useRoute()

const is = (what: string) => route.name === what

const open = (name: string) => {
  router.push({name})
}

const backFromAppstore = () => {
  if (is('extension-install') || is('extension-settings'))
    open('one-extension')
  else if (is('one-extension'))
    open('extstore-showcase')
  else open('index')
}
</script>
