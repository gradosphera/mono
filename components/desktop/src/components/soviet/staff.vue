<template lang="pug">
div
  div.row.justify-center
    div(v-if="staff.length > 0").col-md-12
      q-card(v-if="staff" flat)
        q-table(
          ref="tableRef" v-model:expanded="expanded"
          flat
          bordered
          :rows="staff"
          :columns="columns"
          :table-colspan="9"
          row-key="username"
          :pagination="pagination"
          virtual-scroll
          :virtual-scroll-item-size="48"
          :rows-per-page-options="[10]"

        ).full-height

          template(#bottom)
            q-btn(icon="add" flat @click="showAdd = true") добавить администратора


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
              q-td {{ props.row.position_title }}

              q-td {{ props.row.data?.user_profile?.last_name }}
              q-td {{ props.row.data?.user_profile?.first_name }}
              q-td {{ props.row.data?.user_profile?.middle_name }}
              q-td {{ props.row.data?.user_profile?.phone }}
              q-td {{ props.row.data?.email }}
              q-td {{ moment(props.row.data?.user_profile?.birthday).format('DD.MM.YY') }}

              // q-td
              //   q-badge(v-for="(right, index) of props.row.rights" v-bind:key="index" ).q-pa-xs.q-ma-xs {{right.contract}}::{{right.action_name}}

            q-tr(v-show="props.expand" :key="`e_${props.row.index}`" :props="props" class="q-virtual-scroll--with-prev")
              q-td(colspan="100%")
                div.row
                  div.row
                    span.text-grey.full-width Разрешения {{ props.row.username }}
                    div(v-for="(right, index) of props.row.rights" :key="index" ).q-pa-sm
                      q-card
                        q-input(v-model="right.contract" square standout="bg-teal text-white" label="Контракт")
                        q-input(v-model="right.action_name" square standout="bg-teal text-white" label="Действие")
                        q-btn( icon="fas fa-trash" size="xs" flat color="grey" @click="rmRight(index, props.row.username)").full-width

                    q-btn(flat color="primary" size="lg" icon="fas fa-plus" @click="addRight(props.row.username)")
                  q-btn(size="md" color="primary" @click="setRights(props.row.username)").full-width.text-center.q-mt-lg Сохранить



    div(v-else)
      p.full-width.text-center.text-grey.no-select у кооператива нет пайщиков



  q-dialog(v-model="showAdd" persistent :maximized="false" )
    q-card
      div()
        q-bar.bg-primary.text-white
          span Добавить администратора
          q-space
          q-btn(v-close-popup dense flat icon="close")
            q-tooltip Close

        div.q-pa-sm.row.justify-center
          div.q-pa-md
            span Внимание! Вы собираетесь добавить администратора в кооператив.
            div
              q-input(v-model="newPersona.username" label="Имя аккаунта")
              q-input(v-model="newPersona.position_title" label="Должность")
            div.q-mt-lg
              q-btn(flat @click="showAdd = false") Назад
              q-btn(color="primary" @click="addStaff") Добавить






</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Notify } from 'quasar';
import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)
const showAdd = ref(false);
import moment from 'moment-with-locales-es6'
import { useAddAdmin } from 'src/features/Cooperative/AddAdmin';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { useCooperativeStore } from 'src/entities/Cooperative';
import { useSetRights } from 'src/features/Cooperative/SetRights';
const cooperativeStore = useCooperativeStore()
const staff = computed(() => cooperativeStore.admins)

const loadStaff = async () => {

  try {
    await cooperativeStore.loadAdmins(info.coopname)
  } catch (e: any) {

    Notify.create({
      message: e.message,
      type: 'negative',
    })

  }

}

loadStaff()

const newPersona = ref({
  username: '',
  position_title: ''
})


const addRight = (newUsername: string) => {
  const user = staff.value.find(u => u.username === newUsername);

  if (user)
    user.rights.push({ contract: '', action_name: '' })

}


const rmRight = (rightIndex: number, username: string) => {
  // Найти пользователя в массиве staff.
  const user = staff.value.find(u => u.username === username) as any

  if (user) {
    // Удалить элемент из массива rights этого пользователя.
    user.rights.splice(rightIndex, 1);
  }
}

const addStaff = async () => {
  try {
    useAddAdmin().addAdmin({
      coopname: info.coopname,
      chairman: username.value,
      username: newPersona.value.username,
      rights: [],
      position_title: newPersona.value.position_title,
    })

    cooperativeStore.loadAdmins(info.coopname)

    newPersona.value = {
      username: '',
      position_title: ''
    }

    showAdd.value = false

    Notify.create({
      message: 'Администратор добавлен',
      type: 'positive',
    })

  } catch (e: any) {

    Notify.create({
      message: e.message,
      type: 'negative',
    })

  }
}



// const rmStaff = async (username) => {
//   try {
      // await useDeleteAdmin().deleteAdmin({
      //   coopname: info.coopname,
      //   chairman: session.username,
      //   username
      // })

    // cooperativeStore.loadAdmins(info.coopname)

//     Notify.create({
//       message: 'Администратор уволен',
//       type: 'positive',
//     })

//     if (isSelected.valud == username)
//       selected.value = ''

//   } catch (e) {

//     Notify.create({
//       message: e.message,
//       type: 'negative',
//     })

//   }
// }




const setRights = async (newUsername: string) => {
  try {

    const user = staff.value.find(u => u.username === newUsername);

    await useSetRights().setRights({
      coopname: info.coopname,
      chairman: username.value,
      username: newUsername,
      rights: user?.rights as { contract: string; action_name: string; }[]
    })

    loadStaff()

    Notify.create({
      message: 'Права сохранены',
      type: 'positive',
    })

  } catch (e: any) {

    Notify.create({
      message: e.message,
      type: 'negative',
    })

  }
}




const columns = [
  { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
  { name: 'position_title', align: 'left', label: 'Должность', field: 'position_title', sortable: true },
  { name: 'last_name', align: 'left', label: 'Фамилия', field: 'last_name', sortable: true },
  { name: 'first_name', align: 'left', label: 'Имя', field: 'first_name', sortable: true },
  { name: 'middle_name', align: 'left', label: 'Отчество', field: 'middle_name', sortable: true },
  { name: 'phone', align: 'left', label: 'Телефон', field: 'phone', sortable: false },
  { name: 'email', align: 'left', label: 'Е-почта', field: 'email', sortable: false },
  { name: 'birthday', align: 'left', label: 'Дата рождения', field: 'birthday', sortable: true },
] as any


const expanded = ref([])
const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

</script>
