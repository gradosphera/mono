<template lang="pug">
q-table(
  ref="tableRef" v-model:expanded="expanded"
  flat
  bordered
  :rows="participants.results"
  :columns="columns"
  :table-colspan="9"
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
        // q-toggle(v-model="props.expand" checked-icon="fas fa-chevron-circle-left" unchecked-icon="fas fa-chevron-circle-right" )
        q-btn(size="sm" color="primary" round dense :icon="props.expand ? 'remove' : 'add'" @click="props.expand = !props.expand")
      q-td {{ props.row.username }}
      q-td {{ props.row.private_data?.last_name }}
      q-td {{ props.row.private_data?.first_name }}
      q-td {{ props.row.private_data?.middle_name }}
      q-td {{ props.row.private_data?.phone }}
      q-td {{ props.row.private_data?.email }}
      q-td {{ moment(props.row.private_data?.birthdate).format('DD.MM.YY') }}
      q-td {{ moment(props.row.private_data._created_at).format('DD.MM.YY HH:mm:ss') }}


    q-tr(v-show="props.expand" :key="`e_${props.row.username}`" :props="props" class="q-virtual-scroll--with-prev")
      q-td(colspan="100%")
        slot(:expand="props.expand" :receiver="props.row.username")

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Notify } from 'quasar'

import { sendGET } from 'src/shared/api';
const participants = ref({ results: [] })
const onLoading = ref(false)

import moment from 'moment-with-locales-es6'

const loadParticipants = async () => {
  try {
    onLoading.value = true

    participants.value = await sendGET('/v1/users', {
      limit: 100
    })

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
  { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
  { name: 'last_name', align: 'left', label: 'Фамилия', field: 'last_name', sortable: true },
  { name: 'first_name', align: 'left', label: 'Имя', field: 'first_name', sortable: true },
  { name: 'middle_name', align: 'left', label: 'Отчество', field: 'middle_name', sortable: true },

  { name: 'phone', align: 'left', label: 'Телефон', field: 'phone', sortable: false },
  { name: 'email', align: 'left', label: 'Е-почта', field: 'email', sortable: false },
  { name: 'birthday', align: 'left', label: 'Дата рождения', field: 'birthday', sortable: true },
  {
    name: 'created_at',
    align: 'left',
    label: 'Зарегистрирован',
    field: 'created_at',
    sortable: true,
  },
] as any

const expanded = ref([])
const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

</script>
