<template lang="pug">
q-table(
  flat
  :grid="isMobile"
  :rows="accounts"
  :columns="columns"
  row-key="username"
  :pagination="pagination"
  virtual-scroll
  :virtual-scroll-item-size="48"
  :rows-per-page-options="[10]"
  :loading="loading"
  :no-data-label="'У кооператива нет пайщиков'"
).full-height
  template(#top)
    slot(name="top")

  template(#header="props")
    q-tr(:props="props")
      q-th(auto-width)
      q-th(v-for="col in props.cols" :key="col.name" :props="props") {{ col.label }}

  template(#body="props")
    q-tr(:key="`m_${props.row.username}`" :props="props")
      q-td(auto-width)
        q-btn(
          size="sm"
          color="primary"
          round
          dense
          :icon="expanded.get(props.row.username) ? 'remove' : 'add'"
          @click="onToggleExpand(props.row.username)"
        )
      q-td(style="max-width: 150px; word-wrap: break-word; white-space: normal;") {{ getName(props.row) }}
      q-td {{ props.row.provider_account?.email }}
      q-td {{ props.row.username }}
      q-td {{ formatDate(props.row.blockchain_account?.created) }}
    q-tr(
      v-if="expanded.get(props.row.username)"
      :key="`e_${props.row.username}`"
      :props="props"
      class="q-virtual-scroll--with-prev"
    )
      q-td(colspan="100%")
        ParticipantDetails(
          :participant="props.row"
          :tab-name="currentTab[props.row.username]"
          @update="newData => onUpdate(props.row, newData)"
        )

  template(#item="props")
    ParticipantCard(
      :participant="props.row"
      :expanded="expanded"
      @toggle-expand="onToggleExpand"
      @update="onUpdate"
    )
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useWindowSize } from 'src/shared/hooks'
import moment from 'moment-with-locales-es6'
import { ParticipantCard, ParticipantDetails } from '.'
import {
  AccountTypes,
  type IAccount,
  type IIndividualData,
  type IOrganizationData,
  type IEntrepreneurData
} from 'src/entities/Account/types'

// Props
defineProps<{
  accounts: IAccount[]
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void
  (e: 'update', account: IAccount, newData: IIndividualData | IOrganizationData | IEntrepreneurData): void
}>()

// Локальное состояние
const expanded = reactive(new Map<string, boolean>())
const currentTab = reactive<Record<string, string>>({})
const pagination = ref({ rowsPerPage: 10 })
const { isMobile } = useWindowSize()

// Колонки таблицы
const columns: any[] = [
  { name: 'name', align: 'left', label: 'ФИО / Наименование', field: 'name', sortable: true },
  { name: 'email', align: 'left', label: 'Е-почта', field: 'email', sortable: true },
  { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
  { name: 'created_at', align: 'left', label: 'Зарегистрирован', field: 'created_at', sortable: true },
]

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
const onToggleExpand = (id: string) => {
  expanded.set(id, !expanded.get(id))
  if (!currentTab[id]) currentTab[id] = 'info'
  emit('toggle-expand', id)
}

const onUpdate = (account: IAccount, newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
  emit('update', account, newData)
}
</script>
