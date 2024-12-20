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

        Welcome
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
import Welcome from './Welcome.vue'
import SelectBranch from './SelectBranch.vue'

import { COOPNAME } from 'src/shared/config'
import { useCurrentUserStore } from 'src/entities/User'

import { useRegistratorStore } from 'src/entities/Registrator'
import { useLogoutUser } from 'src/features/Registrator/Logout'
import { useSessionStore } from 'src/entities/Session'
import { useAgreementStore } from 'src/entities/Agreement'
import { useWalletStore } from 'src/entities/Wallet'

import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model'

const currentUser = useCurrentUserStore()
const router = useRouter()
const { state, clearUserData, steps } = useRegistratorStore()
const session = useSessionStore()
const store = state
const username = computed(() => session.username)
const agreementer = useAgreementStore()
const wallet = useWalletStore()

onMounted(() => {
  agreementer.loadCooperativeAgreements(COOPNAME)
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

  clearUserData()

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
    store.step = steps.Welcome
  }
})

watch(
  () => [store.step, store.email, store.account, store.userData],
  () => {
    if (store.step >= steps.GenerateAccount && store.step < steps.WaitingRegistration) {
      currentUser.loadProfile(username.value, COOPNAME)
      wallet.loadUserWalet({coopname: COOPNAME, username: username.value})
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

const system = useSystemStore()
const isBranched = computed(() => system.info?.cooperator_account.is_branched)

</script>
<style></style>
