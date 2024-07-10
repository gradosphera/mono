<template lang="pug">
div.row
  div(v-if="members").col-md-12
    q-card(v-if="members.length > 0" flat)
      q-table(
        ref="tableRef" flat
        bordered
        :rows="members"
        :columns="columns"
        :table-colspan="9"
        row-key="username"
        :pagination="pagination"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :rows-per-page-options="[10]"
      ).full-height

        template(#bottom)
          q-btn(icon="add" flat @click="showAdd = true") добавить участника


        template(#header="props")
          q-tr(:props="props")
            q-th(
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            ) {{ col.label }}

            q-th(auto-width)


        template(#body="props")
          q-tr(:key="`m_${props.row.username}`" :props="props")
            q-td {{ props.row.position_title }}

            q-td {{ props.row.username }}
            q-td {{ props.row.data?.user_profile?.last_name }}
            q-td {{ props.row.data?.user_profile?.first_name }}
            q-td {{ props.row.data?.user_profile?.middle_name }}

            q-td {{ props.row.data?.user_profile?.phone }}
            q-td {{ props.row.data?.email }}
            q-td {{ moment(props.row.data?.user_profile?.birthday).format('DD.MM.YY') }}

            // q-td
            //   q-badge(v-for="(right, index) of props.row.rights" v-bind:key="index" ).q-pa-xs.q-ma-xs {{right.contract}}::{{right.action_name}}
            q-td(auto-width)
              q-btn(size="sm" color="primary" round dense icon="clear" @click="removeMember(props.row.username)")


  q-dialog(v-model="showAdd" persistent :maximized="false" )
    q-card
      div()
        q-bar.bg-primary.text-white
          span Добавить сотрудника
          q-space
          q-btn(v-close-popup dense flat icon="close")
            q-tooltip Close

        div.q-pa-sm.row.justify-center
          div.q-pa-md
            span Внимание! Вы собиретесь добавить участика в совет кооператива.
            div
              q-input(v-model="persona.username" label="Имя аккаунта")
              q-input(v-model="persona.position_title" label="Позиция")
            div.q-mt-lg
              q-btn(flat @click="showAdd = false") Назад
              q-btn(color="primary" @click="addMember") Добавить



</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Notify } from 'quasar';
import moment from 'moment-with-locales-es6'
import { readBlockchain, sendGET } from 'src/shared/api'
import { useSessionStore } from 'src/entities/Session';
import { useUpdateBoard } from 'src/features/Cooperative/UpdateBoard';
import { COOPNAME } from 'src/shared/config';

const route = useRoute();
const showAdd = ref(false)

const members = ref<any>([]);
let members_reserve: any = []

const persona = ref({
  username: '',
  position_title: '',
})


const loadMembers = async () => {

  try {
    members.value = await sendGET('/v1/coop/members', {
      coopname: route.params.coopname
    })

    members_reserve = JSON.parse(JSON.stringify(members.value))

  } catch (e: any) {
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}


loadMembers()

const addMember = async () => {
  const verified = await verify(persona.value.username)

  if (!verified) {
    Notify.create({
      message: 'Имя аккаунта на найдено',
      type: 'negative',
    })

    return
  }

  members.value.push({ username: persona.value.username, position_title: persona.value.position_title, position: 'member', is_voting: true });

  updateBoard()
  showAdd.value = false
};

const removeMember = (username: string) => {
  members.value = members.value.filter((el: { username: string; }) => el.username != username)
  updateBoard()
};

const verify = async (username: string) => {

  try {
    await readBlockchain.v1.chain.get_account(username);
    return true;
  } catch (e) {
    return false;
  }
};


const updateBoard = async () => {
  try {

    let members_for_send = members.value.map((el: { username: any; position_title: any; position: any; is_voting: any; }) => {

      return {
        username: el.username,
        position_title: el.position_title,
        position: el.position,
        is_voting: el.is_voting
      }

    })

    await useUpdateBoard().updateBoard({
      coopname: COOPNAME,
      chairman: useSessionStore().username,
      board_id: 0,
      members: members_for_send,
      name: 'Совет',
      description: 'Совет кооператива'
    })


    Notify.create({
      message: 'Совет обновлен',
      type: 'positive',
    })

    loadMembers()


  } catch (e: any) {
    members.value = members_reserve
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}




const columns = [
  { name: 'position_title', align: 'left', label: 'Позиция', field: 'position_title', sortable: true },

  { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
  { name: 'last_name', align: 'left', label: 'Фамилия', field: 'last_name', sortable: true },
  { name: 'first_name', align: 'left', label: 'Имя', field: 'first_name', sortable: true },
  { name: 'middle_name', align: 'left', label: 'Отчество', field: 'middle_name', sortable: true },

  { name: 'phone', align: 'left', label: 'Телефон', field: 'phone', sortable: false },
  { name: 'email', align: 'left', label: 'Е-почта', field: 'email', sortable: false },
  { name: 'birthday', align: 'left', label: 'Дата рождения', field: 'birthday', sortable: true },
] as any

const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

</script>
