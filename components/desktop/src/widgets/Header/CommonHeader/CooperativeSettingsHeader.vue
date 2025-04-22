<!-- CooperativeSettingsHeader.vue -->
<template lang="pug">
q-header(bordered).bg-gradient-dark
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
      q-route-tab(name="Совет" label="Совет" :to="{name: 'members'}" )
      q-route-tab(name="Кооперативные участки" label="Кооперативные участки" :to="{name: 'branches'}" )
      q-route-tab(name="Фонды накопления" label="Фонды накопления" :to="{name: 'accumulation-funds'}" )
      q-route-tab(name="Фонды списания" label="Фонды списания" :to="{name: 'expense-funds'}" )
      q-route-tab(name="Взносы" label="Взносы" :to="{name: 'initial-contributions'}" )
      q-route-tab(name="Контакты" label="Контакты" :to="{name: 'change-contacts'}" )
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import './HeaderStyles.scss'

const router = useRouter()

const open = (name: string) => {
  router.push({name})
}
</script>
