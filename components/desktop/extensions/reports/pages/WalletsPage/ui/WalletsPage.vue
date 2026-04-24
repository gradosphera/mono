<template lang="pug">
div.page-shell
  q-tabs.bg-white(
    v-model='activeTab'
    dense
    align='left'
    active-color='primary'
    indicator-color='primary'
    narrow-indicator
    no-caps
  )
    q-tab(name='coop' icon='fa-solid fa-building' label='Кооператив')
    q-tab(name='participants' icon='fa-solid fa-users' label='Пайщики')

  q-separator

  q-tab-panels(v-model='activeTab' animated keep-alive)
    q-tab-panel(name='coop' class='q-pa-none')
      CoopWalletsTab

    q-tab-panel(name='participants' class='q-pa-none q-mt-md')
      ParticipantWalletsTab
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CoopWalletsTab from './CoopWalletsTab.vue'
import ParticipantWalletsTab from './ParticipantWalletsTab.vue'

// Таб «Кооператив» — агрегированный вид кошельков ledger2 (2001/2002/9001 и т.д.),
// существовавший исходно на странице. Таб «Пайщики» — срез progwallets
// из soviet, матрица пайщик × программа (реальные деньги у конкретных людей).
const activeTab = ref<'coop' | 'participants'>('coop')
</script>
