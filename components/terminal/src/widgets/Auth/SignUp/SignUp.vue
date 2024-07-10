<template lang='pug'>
div
  q-card.bordered.q-pa-md.signup(flat)
    p.text-h6.text-center.q-mb-md ВСТУПИТЬ В ПАЙЩИКИ

    q-stepper(v-model='store.step', vertical, animated, flat, done-color='primary')
      EmailInput

      DataInput

      GenerateAccount

      ReadStatement

      SignStatement

      PayInitial(v-model:data='store.userData', v-model:step='store.step')

      WaitingRegistration(v-model:data='store.userData', v-model:step='store.step')

      Welcome(v-model:data='store.userData', v-model:step='store.step')
  q-btn(@click="logout" size="sm" flat)
    q-icon(name="logout")
    span.q-ml-sm начать с начала
</template>

<script lang="ts" setup>
import { watch, onMounted, onBeforeUnmount } from 'vue'
import EmailInput from './EmailInput.vue'
import GenerateAccount from './GenerateAccount.vue'
import DataInput from './DataInput.vue'
import SignStatement from './SignStatement.vue'
import ReadStatement from './ReadStatement.vue'
import PayInitial from './PayInitial.vue'
import WaitingRegistration from './WaitingRegistration.vue'
import Welcome from './Welcome.vue'

import { createUserStore as store } from 'src/features/User/CreateUser'
import { COOPNAME } from 'src/shared/config'
import { LocalStorage } from 'quasar'
import { useCurrentUserStore } from 'src/entities/User'
import { useLogoutUser } from 'src/features/User/Logout'

const currentUser = useCurrentUserStore()

onMounted(() => {
  if (!currentUser.isRegistrationComplete) {

    if (currentUser.userAccount?.status === 'registered' || currentUser.userAccount?.status === 'active' || currentUser.userAccount?.status === 'blocked') {
      store.step = 7
      return
    }
  }

})

const logout = async () => {
  const { logout } = await useLogoutUser()
  await logout()
  clearLocalStorage()
  LocalStorage.removeItem(`${COOPNAME}:step`)
  LocalStorage.removeItem(`${COOPNAME}:is_paid`)
  LocalStorage.removeItem(`${COOPNAME}:userData`)
  LocalStorage.removeItem(`${COOPNAME}:email`)
  LocalStorage.removeItem(`${COOPNAME}:account`)

  store.step = 1
  window.location.reload()
}

const clearLocalStorage = () => {
  LocalStorage.removeItem(`${COOPNAME}:email`)
  LocalStorage.removeItem(`${COOPNAME}:userData`)
  LocalStorage.removeItem(`${COOPNAME}:account`)
}

onBeforeUnmount(() => {
  if (store.step == 8) {
    store.step = 1
    clearLocalStorage()
    LocalStorage.removeItem(`${COOPNAME}:step`)
    LocalStorage.removeItem(`${COOPNAME}:is_paid`)
  }
})

watch(() => currentUser.participantAccount, (newValue) => {
  if (newValue) {
    console.log('on watch: ', currentUser.participantAccount)
    store.step = 8
    clearLocalStorage()
  }
})

watch(
  () => [store.step, store.email, store.account, store.userData],
  () => {
    if (store.step == 4) {
      LocalStorage.setItem(`${COOPNAME}:account`, JSON.stringify(store.account))
    }

    if (store.step >= 4) {
      currentUser.loadProfile(store.account.username, COOPNAME)
      LocalStorage.setItem(`${COOPNAME}:step`, store.step)
    }


    LocalStorage.setItem(`${COOPNAME}:email`, store.email)
    LocalStorage.setItem(`${COOPNAME}:userData`, JSON.stringify(store.userData))
  }
)
</script>
<style></style>
