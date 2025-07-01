<template lang="pug">
.row.justify-center.q-pa-sm
  .col-md-6.col-sm-8.col-xs-12
    q-card.q-pa-md.signup.q-pt-lg(flat)
      p.text-h6.text-center.q-mb-md ВСТУПИТЬ В ПАЙЩИКИ
      q-stepper(
        v-model='store.step',
        vertical,
        animated,
        flat,
        done-color='primary'
      )
        EmailInput

        SetUserData

        GenerateAccount

        SelectBranch(v-if='isBranched')

        ReadStatement

        SignStatement

        PayInitial

        WaitingRegistration

    q-btn(@click='out', dense, size='sm', flat) начать с начала
</template>

<script lang="ts" setup>
import { watch, onMounted, onBeforeUnmount, computed } from 'vue';
import EmailInput from './EmailInput.vue';
import GenerateAccount from './GenerateAccount.vue';
import SetUserData from './SetUserData.vue';
import SignStatement from './SignStatement.vue';
import ReadStatement from './ReadStatement.vue';
import PayInitial from './PayInitial.vue';
import WaitingRegistration from './WaitingRegistration.vue';
import SelectBranch from './SelectBranch.vue';

import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore();

import { useCurrentUser } from 'src/entities/Session';

import { useRegistratorStore } from 'src/entities/Registrator';
import { useLogoutUser } from 'src/features/User/Logout';
import { useSessionStore } from 'src/entities/Session';
import { useAgreementStore } from 'src/entities/Agreement';

import { useRouter } from 'vue-router';
import { useInitWalletProcess } from 'src/processes/init-wallet';
import { useDesktopStore } from 'src/entities/Desktop';
import { Zeus } from '@coopenomics/sdk';

const currentUser = useCurrentUser();
const session = useSessionStore();
const router = useRouter();
const { state, clearUserData, steps } = useRegistratorStore();
const store = state;
const agreementer = useAgreementStore();
const desktops = useDesktopStore();

onMounted(() => {
  agreementer.loadCooperativeAgreements(info.coopname);
  if (!currentUser.isRegistrationComplete.value) {
    const userStatus = currentUser.providerAccount.value?.status;
    if (
      userStatus === Zeus.UserStatus.Registered ||
      userStatus === Zeus.UserStatus.Active ||
      userStatus === Zeus.UserStatus.Blocked
    ) {
      store.step = steps.WaitingRegistration;
      return;
    }
  }
});

const out = async () => {
  const { logout } = await useLogoutUser();
  await logout();
  window.location.reload();
};

onBeforeUnmount(() => {
  if (store.step == steps.Welcome) {
    clearUserData();
  }
});

watch(
  () => session.currentUserAccount?.participant_account,
  (newValue) => {
    if (newValue) {
      clearUserData();
      desktops.selectDefaultWorkspace();
      desktops.goToDefaultPage(router);
    }
  },
  { deep: true },
);

watch(
  () => [store.step, store.email, store.account, store.userData],
  () => {
    if (
      store.step >= steps.GenerateAccount &&
      store.step < steps.WaitingRegistration
    ) {
      useInitWalletProcess().run();
    }
  },
);

const registeredAndloggedIn = computed(() => {
  return (
    currentUser.isRegistrationComplete.value &&
    session.isAuth &&
    store.step == steps.EmailInput
  );
});

watch(
  () => registeredAndloggedIn,
  (newValue) => {
    if (newValue.value === true) {
      desktops.selectDefaultWorkspace();
      desktops.goToDefaultPage(router);
    }
  },
);

const isBranched = computed(() => info.cooperator_account.is_branched);
</script>
<style></style>
