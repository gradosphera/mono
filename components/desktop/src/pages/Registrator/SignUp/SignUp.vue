<template lang='pug'>
.row.justify-center.q-pa-sm
  .col-md-6.col-sm-8.col-xs-12
    q-card.q-pa-md.signup(flat).q-pt-lg
      p.text-h6.text-center.q-mb-md ВСТУПИТЬ В ПАЙЩИКИ
      q-stepper(v-model='store.step', vertical, animated, flat, done-color='primary')
        EmailInput

        SetUserData

        GenerateAccount

        SelectBranch(v-if="isBranched")

        ReadStatement

        SignStatement

        PayInitial

        WaitingRegistration

    q-btn(@click="out" dense size="sm" flat) начать с начала


</template>

<script lang="ts" setup>
import { watch, onMounted, onBeforeUnmount, computed } from 'vue'
import EmailInput from './EmailInput.vue'
import GenerateAccount from './GenerateAccount.vue'
import SetUserData from './SetUserData.vue'
import SignStatement from './SignStatement.vue'
import ReadStatement from './ReadStatement.vue'
import PayInitial from './PayInitial.vue'
import WaitingRegistration from './WaitingRegistration.vue'
import SelectBranch from './SelectBranch.vue'

import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { useCurrentUserStore } from 'src/entities/User'

import { useRegistratorStore } from 'src/entities/Registrator'
import { useLogoutUser } from 'src/features/User/Logout'
import { useSessionStore } from 'src/entities/Session'
import { useAgreementStore } from 'src/entities/Agreement'

import { useRouter } from 'vue-router';
import { useInitWalletProcess } from 'src/processes/init-wallet'

const currentUser = useCurrentUserStore()
const router = useRouter()
const { state, clearUserData, steps } = useRegistratorStore()
const store = state
const agreementer = useAgreementStore()

onMounted(() => {
  agreementer.loadCooperativeAgreements(info.coopname)
  if (!currentUser.isRegistrationComplete) {

    if (currentUser.userAccount?.status === 'registered' || currentUser.userAccount?.status === 'active' || currentUser.userAccount?.status === 'blocked') {
      store.step = steps.WaitingRegistration
      return
    }
  }
})


const out = async () => {
  const { logout } = await useLogoutUser()
  await logout()
  window.location.reload()
}

onBeforeUnmount(() => {
  if (store.step == steps.Welcome) {
    clearUserData()
  }
})

watch(() => currentUser.participantAccount, (newValue) => {
  if (newValue) {
    clearUserData()
    router.push({name: 'index'})
  }
})

watch(
  () => [store.step, store.email, store.account, store.userData],
  () => {
    if (store.step >= steps.GenerateAccount && store.step < steps.WaitingRegistration) {
      useInitWalletProcess().run()
      // currentUser.loadProfile(username.value, info.coopname)
      // wallet.loadUserWallet({coopname: info.coopname, username: username.value})
    }
  }
)

const registeredAndloggedIn = computed(() => {
  return currentUser.isRegistrationComplete && useSessionStore().isAuth && store.step == steps.EmailInput
})

watch(() => registeredAndloggedIn, (newValue) => {
  if (newValue.value === true)
    router.push({name: 'index'})
})

const isBranched = computed(() => info.cooperator_account.is_branched)

</script>
<style></style>
