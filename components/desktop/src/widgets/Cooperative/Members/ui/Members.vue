<template lang="pug">
div
  div(v-if='members')
    q-card(v-if='members.length > 0', flat)
      q-table.full-height(
        ref='tableRef',
        flat,
        bordered,
        :rows='members',
        :columns='columns',
        :table-colspan='9',
        row-key='username',
        :pagination='pagination',
        virtual-scroll,
        :virtual-scroll-item-size='48',
        :rows-per-page-options='[10]'
      )
        template(#top)
          q-btn(
            icon='add',
            @click='showAdd = true',
            color='primary',
            size='sm'
          ) добавить участника

        template(#header='props')
          q-tr(:props='props')
            q-th(v-for='col in props.cols', :key='col.name', :props='props') {{ col.label }}

            q-th(auto-width)

        template(#body='props')
          q-tr(:key='`m_${props.row.username}`', :props='props')
            q-td
              q-badge(v-if='props.row.position === "chairman"') Председатель совета
              q-badge(v-if='props.row.position === "member"') Член совета

            q-td {{ props.row.username }}
            q-td {{ props.row.last_name }}
            q-td {{ props.row.first_name }}
            q-td {{ props.row.middle_name }}

            q-td {{ props.row.phone }}
            q-td {{ props.row.email }}

            q-td(auto-width)
              q-btn(
                size='sm',
                color='red',
                dense,
                @click='removeMember(props.row.username)',
                :loading='showLoading'
              ) удалить

  AddMemberDialog(v-model='showAdd', :loading='showLoading', @add='addMember')
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Notify } from 'quasar';
import { readBlockchain } from 'src/shared/api';
import { useSessionStore } from 'src/entities/Session';
import {
  useUpdateBoard,
  AddMemberDialog,
} from 'src/features/Cooperative/UpdateBoard';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore();

import { useCooperativeStore } from 'src/entities/Cooperative';
import { sleep } from 'src/shared/api/sleep';

const coop = useCooperativeStore();

const showAdd = ref(false);

const members = computed(() => coop.privateCooperativeData?.members || []);

const loadMembers = async () => {
  coop.loadPrivateCooperativeData();
};

const showLoading = ref(false);

loadMembers();

const addMember = async (username: string) => {
  const verified = await verify(username);

  if (!verified) {
    Notify.create({
      message: 'Имя аккаунта на найдено',
      type: 'negative',
    });

    return;
  }

  let members_for_send = members.value.map(
    (el: {
      username: any;
      position_title: any;
      position: any;
      is_voting: any;
    }) => {
      return {
        username: el.username,
        position_title: el.position_title,
        position: el.position,
        is_voting: el.is_voting,
      };
    },
  );

  members_for_send.push({
    username: username,
    position_title: 'Член совета',
    position: 'member',
    is_voting: true,
  });

  showLoading.value = true;

  try {
    await updateBoard(members_for_send);
  } catch (e: any) {}

  showLoading.value = false;
  showAdd.value = false;
};

const removeMember = async (username: string) => {
  let members_for_send = members.value.map(
    (el: {
      username: any;
      position_title: any;
      position: any;
      is_voting: any;
    }) => {
      return {
        username: el.username,
        position_title: el.position_title,
        position: el.position,
        is_voting: el.is_voting,
      };
    },
  );

  members_for_send = members_for_send.filter(
    (el: { username: string }) => el.username != username,
  );
  showLoading.value = true;

  try {
    await updateBoard(members_for_send);
  } catch (e: any) {}
  showLoading.value = false;
};

const verify = async (username: string) => {
  try {
    await readBlockchain.v1.chain.get_account(username);
    return true;
  } catch (e) {
    return false;
  }
};

const updateBoard = async (new_members: any) => {
  try {
    const coop = useUpdateBoard();

    await coop.updateBoard({
      coopname: info.coopname,
      username: useSessionStore().username,
      board_id: 0,
      members: new_members,
      name: 'Совет',
      description: 'Совет кооператива',
    });

    await sleep(3000);

    Notify.create({
      message: 'Совет обновлен',
      type: 'positive',
    });

    loadMembers();
  } catch (e: any) {
    loadMembers();
    Notify.create({
      message: e.message,
      type: 'negative',
    });
  }
};

const columns = [
  {
    name: 'position',
    align: 'left',
    label: 'Позиция',
    field: 'position',
    sortable: true,
  },
  {
    name: 'username',
    align: 'left',
    label: 'Аккаунт',
    field: 'username',
    sortable: true,
  },
  {
    name: 'last_name',
    align: 'left',
    label: 'Фамилия',
    field: 'last_name',
    sortable: true,
  },
  {
    name: 'first_name',
    align: 'left',
    label: 'Имя',
    field: 'first_name',
    sortable: true,
  },
  {
    name: 'middle_name',
    align: 'left',
    label: 'Отчество',
    field: 'middle_name',
    sortable: true,
  },
  // { name: 'middle_name', align: 'left', label: 'Отчество', field: 'middle_name', sortable: true },
  {
    name: 'phone',
    align: 'left',
    label: 'Телефон',
    field: 'phone',
    sortable: false,
  },
  {
    name: 'email',
    align: 'left',
    label: 'Е-почта',
    field: 'email',
    sortable: false,
  },
] as any;

const tableRef = ref(null);
const pagination = ref({ rowsPerPage: 10 });
</script>
