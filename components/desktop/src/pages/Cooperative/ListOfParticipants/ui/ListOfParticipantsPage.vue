<template lang="pug">
  q-page.padding
    q-table(
      ref="tableRef"
      flat
      :rows="accountStore.accounts.items"
      :columns="columns"
      row-key="username"
      :pagination="pagination"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :rows-per-page-options="[10]"
      :loading="onLoading"
      :no-data-label="'У кооператива нет пайщиков'"
    ).full-height
      template(#top)
        AddUserDialog
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
              @click="toggleExpand(props.row.username)"
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
          q-td(colspan="100%" style="padding: 0 !important;")
            q-tabs(
              v-model="currentTab[props.row.username]"
              align="justify"
              stretch
              dense
              indicator-color="lime"
            )
              q-tab(name="info" label="Данные" class="bg-primary text-white")
              q-tab(name="document" label="Документы" class="bg-primary text-white")

            q-tab-panels(v-model="currentTab[props.row.username]" animated)
              q-tab-panel(name="info")
                component(:is="useComponent(props.row)" :participantData="usePrivateData(props.row)" @update="newData => update(props.row, newData)")

              q-tab-panel(name="document")
                ListOfDocumentsWidget(:filter="{ receiver: props.row.username }")
  </template>

  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { Notify } from 'quasar'
  import moment from 'moment-with-locales-es6'
  import { useAccountStore } from 'src/entities/Account/model'
  import { EditableEntrepreneurCard } from 'src/shared/ui/EditableEntrepreneurCard'
  import { EditableIndividualCard } from 'src/shared/ui/EditableIndividualCard'
  import { EditableOrganizationCard } from 'src/shared/ui/EditableOrganizationCard'
  import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments'
  import { AddUserDialog } from 'src/features/User/AddUser/ui/AddUserDialog'
  import {
    AccountTypes,
    type IAccount,
    type IIndividualData,
    type IOrganizationData,
    type IEntrepreneurData
  } from 'src/entities/Account/types'

  const accountStore = useAccountStore()
  const onLoading = ref(false)
  const expanded = reactive(new Map<string, boolean>())
  const currentTab = reactive<Record<string, string>>({})
  const tableRef = ref(null)
  const pagination = ref({ rowsPerPage: 10 })

  const columns = [
    { name: 'name', align: 'left', label: 'ФИО / Наименование', field: 'name', sortable: true },
    { name: 'email', align: 'left', label: 'Е-почта', field: 'email', sortable: true },
    { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
    { name: 'created_at', align: 'left', label: 'Зарегистрирован', field: 'created_at', sortable: true },
  ]

  const toggleExpand = (id: string) => {
    expanded.set(id, !expanded.get(id))
    if (!currentTab[id]) currentTab[id] = 'info'
  }

  const loadParticipants = async () => {
    try {
      onLoading.value = true
      await accountStore.getAccounts({ options: { page: 1, limit: 1000, sortOrder: 'DESC' } })
    } catch (e: any) {
      Notify.create({ message: e.message, type: 'negative' })
    } finally {
      onLoading.value = false
    }
  }
  loadParticipants()

  const getName = (account: IAccount) => {
    const d = account.private_account
    if (!d) return ''
    switch (d.type) {
      case AccountTypes.Individual:
        return `${d.individual_data?.last_name} ${d.individual_data?.first_name} ${d.individual_data?.middle_name}`
      case AccountTypes.Entrepreneur:
        return `ИП ${d.entrepreneur_data?.last_name} ${d.entrepreneur_data?.first_name} ${d.entrepreneur_data?.middle_name}`
      case AccountTypes.Organization:
        return d.organization_data?.short_name
      default:
        return ''
    }
  }

  // const getTypeLabel = (type?: string) =>
  //   type === AccountTypes.Individual ? 'физ. лицо' :
  //   type === AccountTypes.Organization ? 'юр. лицо' :
  //   type === AccountTypes.Entrepreneur ? 'инд. предприниматель' : 'неизвестно'

  const formatDate = (date?: string) =>
    date ? moment(date).format('DD.MM.YY HH:mm:ss') : ''

  const useComponent = (account: IAccount) => {
    switch (account.private_account?.type) {
      case AccountTypes.Individual: return EditableIndividualCard
      case AccountTypes.Entrepreneur: return EditableEntrepreneurCard
      case AccountTypes.Organization: return EditableOrganizationCard
    }
  }

  const usePrivateData = (account: IAccount) => {
    switch (account.private_account?.type) {
      case AccountTypes.Individual: return account.private_account.individual_data
      case AccountTypes.Entrepreneur: return account.private_account.entrepreneur_data
      case AccountTypes.Organization: return account.private_account.organization_data
    }
  }

  const update = (account: IAccount, newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
    switch (account.private_account?.type) {
      case AccountTypes.Individual:
        account.private_account.individual_data = {
          ...newData as IIndividualData,
          passport: (newData as IIndividualData).passport ?? undefined
        }
        break
      case AccountTypes.Entrepreneur:
        account.private_account.entrepreneur_data = newData as IEntrepreneurData
        break
      case AccountTypes.Organization:
        account.private_account.organization_data = newData as IOrganizationData
        break
    }
  }
</script>
