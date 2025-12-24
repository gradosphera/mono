<template lang="pug">
div.header-action
  q-btn(
    color='primary',
    :stretch='isMobile',
    :size='isMobile ? "sm" : "md"',
    no-wrap,
    @click='showDialog = true'
  )
    span.q-pr-sm Добавить члена
    i.fa-solid.fa-user-plus

  AddMemberDialog(
    v-model='showDialog',
    :loading='loading',
    @add='addMember'
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import {
  AddMemberDialog,
  useUpdateBoard,
} from 'src/features/Cooperative/UpdateBoard';
import { readBlockchain, SuccessAlert, FailAlert } from 'src/shared/api';
import { sleep } from 'src/shared/api/sleep';
import { useWindowSize } from 'src/shared/hooks';

const showDialog = ref(false);
const loading = ref(false);
const systemStore = useSystemStore();
const { isMobile } = useWindowSize();

const addMember = async (username: string) => {
  loading.value = true;

  try {
    const verified = await verify(username);

    if (!verified) {
      FailAlert('Имя аккаунта не найдено');
      return;
    }

    const membersForSend = (systemStore.info.board_members || []).map(
      (member) => ({
        username: member.username,
        position_title: member.is_chairman ? 'Председатель совета' : 'Член совета',
        position: member.is_chairman ? 'chairman' : 'member',
        is_voting: true,
      }),
    );

    membersForSend.push({
      username,
      position_title: 'Член совета',
      position: 'member',
      is_voting: true,
    });

    await updateBoard(membersForSend);
    showDialog.value = false;
  } catch (e) {
    FailAlert(e);
  } finally {
    loading.value = false;
  }
};

const verify = async (username: string) => {
  try {
    await readBlockchain.v1.chain.get_account(username);
    return true;
  } catch (e) {
    return false;
  }
};

const updateBoard = async (members: any[]) => {
  try {
    const coop = useUpdateBoard();

    await coop.updateBoard({
      coopname: systemStore.info.coopname,
      username: useSessionStore().username,
      board_id: 0,
      members,
      name: 'Совет',
      description: 'Совет кооператива',
    });

    await sleep(3000);
    SuccessAlert('Состав совета обновится через несколько секунд');
    await systemStore.loadSystemInfo();
  } catch (e) {
    await systemStore.loadSystemInfo();
    throw e;
  }
};
</script>

<style scoped lang="scss">
.header-action {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
