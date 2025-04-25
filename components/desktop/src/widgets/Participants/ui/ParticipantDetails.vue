<template lang="pug">
div
  q-tabs.q-mt-sm(
    v-model="currentTab"
    align="justify"
    stretch
    dense
    indicator-color="lime"
    class="bg-grey-2"
  )
    q-tab(name="info" label="Данные" class="bg-primary text-white")
    q-tab(name="document" label="Документы" class="bg-primary text-white")

  q-tab-panels.q-mt-xs(v-model="currentTab" animated)
    q-tab-panel.q-pa-none(name="info")
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
    case AccountTypes.Individual: return EditableIndividualCard
    case AccountTypes.Entrepreneur: return EditableEntrepreneurCard
    case AccountTypes.Organization: return EditableOrganizationCard
  }
}

// Получение данных участника
const usePrivateData = (account: IAccount) => {
  switch (account.private_account?.type) {
    case AccountTypes.Individual: return account.private_account.individual_data
    case AccountTypes.Entrepreneur: return account.private_account.entrepreneur_data
    case AccountTypes.Organization: return account.private_account.organization_data
  }
}

// События
const onUpdate = (newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
  emit('update', newData)
}
</script>
