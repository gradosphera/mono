<template lang="pug">
div
  q-tabs.compact-tabs(
    v-model="currentTab"
    align="justify"
    stretch
    dense
    flat
    inline-label
    switch-indicator
    indicator-color="primary"
  )
    q-tab(name="info" label="Данные" class="compact-tab")
    q-tab(name="document" label="Документы" class="compact-tab")

  q-tab-panels.q-ma-sm.tab-panels-card(v-model="currentTab" animated)
    q-tab-panel.q-pa-none(name="info")
      //приватные данные
      component(:is="useComponent(participant)" :participantData="usePrivateData(participant)" @update="onUpdate")

    q-tab-panel.q-pa-none(name="document")
      ListOfDocumentsWidget(:username="participant.username" :filter="{}")
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { EditableEntrepreneurCard } from 'src/shared/ui/EditableEntrepreneurCard'
import { EditableIndividualCard } from 'src/shared/ui/EditableIndividualCard'
import { EditableOrganizationCard } from 'src/shared/ui/EditableOrganizationCard'
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments'
import 'src/shared/ui/TabStyles/index.scss'
import {
  AccountTypes,
  type IAccount,
  type IIndividualData,
  type IOrganizationData,
  type IEntrepreneurData
} from 'src/entities/Account/types'

// Props
const props = defineProps<{
  participant: IAccount
  tabName?: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update', newData: IIndividualData | IOrganizationData | IEntrepreneurData): void
}>()

// Локальное состояние
const currentTab = ref(props.tabName || 'info')

// Отслеживание изменения tabName в props
watch(() => props.tabName, (newVal) => {
  if (newVal) {
    currentTab.value = newVal
  }
})

// Компонент для редактирования данных
const useComponent = (account: IAccount) => {
  switch (account.private_account?.type) {
    case AccountTypes.individual: return EditableIndividualCard
    case AccountTypes.entrepreneur: return EditableEntrepreneurCard
    case AccountTypes.organization: return EditableOrganizationCard
  }
}

// Получение данных участника
const usePrivateData = (account: IAccount) => {
  switch (account.private_account?.type) {
    case AccountTypes.individual: return account.private_account.individual_data
    case AccountTypes.entrepreneur: return account.private_account.entrepreneur_data
    case AccountTypes.organization: return account.private_account.organization_data
  }
}

// События
const onUpdate = (newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
  emit('update', newData)
}
</script>
