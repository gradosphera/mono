<template lang="pug">
div.q-pa-xs.col-xs-12.col-sm-6.col-md-4.col-lg-3.q-mt-md
  q-card.full-height
    q-card-section
      div.text-h6 {{ getName(participant) }}
      q-separator.q-my-md
      div
        div.text-caption Е-почта:
        div.text-subtitle1.q-mb-xs {{ participant.provider_account?.email || 'Не указана' }}
        div.text-caption Аккаунт:
        div.text-subtitle1.q-mb-xs {{ participant.username }}
        div.text-caption Зарегистрирован:
        div.text-subtitle1 {{ formatDate(participant.blockchain_account?.created) }}
    q-card-actions(align="right")
      q-btn(
        color="primary"
        :icon="isExpanded ? 'remove' : 'add'"
        label="Подробнее"
        @click="toggleExpand"
      )
    q-slide-transition
      div.q-pa-md(v-if="isExpanded")
        q-separator
        ParticipantDetails(
          :participant="participant"
          :tab-name="currentTab"
          @update="onUpdate"
        )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import moment from 'moment-with-locales-es6'
import ParticipantDetails from './ParticipantDetails.vue'
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
  expanded: Map<string, boolean>
}>()

// Emits
const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void
  (e: 'update', account: IAccount, newData: IIndividualData | IOrganizationData | IEntrepreneurData): void
}>()

// Локальное состояние
const currentTab = ref('info')

// Computed
const isExpanded = computed(() => props.expanded.get(props.participant.username))

// Функция для получения имени участника
const getName = (account: IAccount) => {
  const d = account.private_account
  if (!d) return ''
  switch (d.type) {
    case AccountTypes.individual:
      return `${d.individual_data?.last_name} ${d.individual_data?.first_name} ${d.individual_data?.middle_name}`
    case AccountTypes.entrepreneur:
      return `ИП ${d.entrepreneur_data?.last_name} ${d.entrepreneur_data?.first_name} ${d.entrepreneur_data?.middle_name}`
    case AccountTypes.organization:
      return d.organization_data?.short_name
    default:
      return ''
  }
}

// Форматирование даты
const formatDate = (date?: string) =>
  date ? moment(date).format('DD.MM.YY HH:mm:ss') : ''

// События
const toggleExpand = () => {
  emit('toggle-expand', props.participant.username)
}

const onUpdate = (newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
  emit('update', props.participant, newData)
}
</script>
