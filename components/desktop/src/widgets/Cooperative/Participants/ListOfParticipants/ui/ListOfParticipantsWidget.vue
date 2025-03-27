<template lang="pug">

q-table(
  ref="tableRef"
  flat
  :rows="accounts?.items"
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
    slot(name="top")
      
  template(#header="props")
    q-tr(:props="props")
      q-th(auto-width)
      q-th(
        v-for="col in props.cols"
        :key="col.name"
        :props="props"
      ) {{ col.label }}

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
      
      q-td {{ getName(props.row) }}
      q-td {{ props.row.private_account.type === AccountTypes.Individual ? 'физ. лицо' : (props.row.private_account.type === AccountTypes.Organization ? 'юр. лицо' : (props.row.private_account.type === AccountTypes.Entrepreneur ? 'инд. предприниматель' : 'неизвестно')) }}
      q-td {{ props.row.username }}
      q-td {{ moment(props.row.blockchain_account?.created).format('DD.MM.YY HH:mm:ss') }}

    q-tr(v-if="expanded.get(props.row.username)" :key="`e_${props.row.username}`" :props="props" class="q-virtual-scroll--with-prev")
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
            slot(:expand="expanded.get(props.row.username)" :receiver="props.row.username")
          
</template>
<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { Notify } from 'quasar'
  import { EditableEntrepreneurCard } from 'src/shared/ui/EditableEntrepreneurCard';
  import { EditableIndividualCard } from 'src/shared/ui/EditableIndividualCard';
  import { EditableOrganizationCard } from 'src/shared/ui/EditableOrganizationCard';
  import { useAccountStore } from 'src/entities/Account/model';
  import moment from 'moment-with-locales-es6'
  import { type IAccounts, AccountTypes, type IAccount, type IIndividualData, type IOrganizationData, type IEntrepreneurData } from 'src/entities/Account/types';
  
  const accountStore = useAccountStore()
  
  const onLoading = ref(false)

  const update = (
  account: IAccount,
  newData: IIndividualData | IOrganizationData | IEntrepreneurData
) => {
  
  if (account.private_account?.type === AccountTypes.Individual) {
    const individual = newData as IIndividualData;
    account.private_account.individual_data = {
      ...individual,
      passport: individual.passport ?? undefined, // заменяет null на undefined
    };
  } else if (account.private_account?.type === AccountTypes.Entrepreneur) {
    account.private_account.entrepreneur_data = newData as IEntrepreneurData
  } else if (account.private_account?.type === AccountTypes.Organization) {
    account.private_account.organization_data = newData as IOrganizationData
  }
  
};

  
  // `Map` для отслеживания состояния раскрытых строк и вкладок
  const expanded = reactive(new Map<string, boolean>())
  const currentTab = reactive<Record<string, string>>({})

  // Определяем, какой компонент использовать
  const useComponent = (account: IAccount) => {
    switch (account.private_account?.type) {
      case AccountTypes.Individual:
        return EditableIndividualCard
      case AccountTypes.Entrepreneur:
        return EditableEntrepreneurCard
      case AccountTypes.Organization:
        return EditableOrganizationCard
    }
  }
  
  const usePrivateData = (account: IAccount) => {
    switch (account.private_account?.type) {
      case AccountTypes.Individual:
        return account.private_account?.individual_data
      case AccountTypes.Entrepreneur:
      return account.private_account?.entrepreneur_data
      case AccountTypes.Organization:
      return account.private_account?.organization_data
    }
  }
  
  const accounts = ref<IAccounts>({items: [], totalCount: 0, totalPages: 0, currentPage: 1})
  
  // Загружаем данные
  const loadParticipants = async () => {
    try {
      onLoading.value = true

      accounts.value = await accountStore.getAccounts({options: {
        page: 1,
        limit: 1000,
        sortOrder: 'DESC'
      }})
            
      onLoading.value = false
    } catch (e: any) {
      onLoading.value = false
      Notify.create({
        message: e.message,
        type: 'negative',
      })
    }
  }

  loadParticipants()

  const columns = [
    { name: 'name', align: 'left', label: 'ФИО / Наименование', field: 'name', sortable: true },
    { name: 'type', align: 'left', label: 'Тип', field: 'type' },
    { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
    {
      name: 'created_at',
      align: 'left',
      label: 'Зарегистрирован',
      field: 'created_at',
      sortable: true,
    },
  ] as any

  const tableRef = ref(null)
  const pagination = ref({ rowsPerPage: 10 })

  // Функция для переключения раскрытия строки
  const toggleExpand = (id: string) => {
    expanded.set(id, !expanded.get(id))
    if (!currentTab[id]) {
      currentTab[id] = 'info' // Устанавливаем вкладку по умолчанию
    }
  }
  
  const getName = (account: IAccount) => {
    if (account?.private_account?.type === AccountTypes.Individual){
      return `${account.private_account.individual_data?.last_name} ${account.private_account.individual_data?.first_name} ${account.private_account.individual_data?.middle_name}`
    } else if (account?.private_account?.type === AccountTypes.Entrepreneur){
      return `${account.private_account.entrepreneur_data?.last_name} ${account.private_account.entrepreneur_data?.first_name} ${account.private_account.entrepreneur_data?.middle_name}`      
    } else if (account?.private_account?.type === AccountTypes.Organization){
      return `${account.private_account.organization_data?.short_name}`
    }
  }

  </script>
