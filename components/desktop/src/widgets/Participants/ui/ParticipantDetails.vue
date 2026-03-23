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
      //приватные данные (отдельные ветки — иначе vue-tsc не сужает union для :is)
      EditableIndividualCard(
        v-if="individualParticipantData"
        :participantData="individualParticipantData"
        @update="onUpdate"
      )
      EditableEntrepreneurCard(
        v-if="entrepreneurParticipantData"
        :participantData="entrepreneurParticipantData"
        @update="onUpdate"
      )
      EditableOrganizationCard(
        v-if="organizationParticipantData"
        :participantData="organizationParticipantData"
        @update="onUpdate"
      )

    q-tab-panel.q-pa-none(name="document")
      ListOfDocumentsWidget(:username="participant.username" :filter="{}")
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

const individualParticipantData = computed((): IIndividualData | null => {
  const pa = props.participant.private_account
  if (pa?.type !== AccountTypes.individual) return null
  return pa.individual_data ?? null
})

const entrepreneurParticipantData = computed((): IEntrepreneurData | null => {
  const pa = props.participant.private_account
  if (pa?.type !== AccountTypes.entrepreneur) return null
  return pa.entrepreneur_data ?? null
})

const organizationParticipantData = computed((): IOrganizationData | null => {
  const pa = props.participant.private_account
  if (pa?.type !== AccountTypes.organization) return null
  return pa.organization_data ?? null
})

// События
const onUpdate = (newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
  emit('update', newData)
}
</script>
