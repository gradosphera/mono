<template lang="pug">
div
  q-step(
    :name="store.steps.WaitingRegistration"
    title="Получите решение совета о приёме Вас в пайщики кооператива"
    :done="store.isStepDone('WaitingRegistration')"
  )
    template(v-if="currentUser?.userAccount?.status !== 'failed'")
      p Ваш платеж принят. Ожидаем, когда совет рассмотрит Ваше заявление и примет решение о приёме Вас в пайщики. Это может занять до 24 часов. Вы получите уведомление, когда решение будет принято.
      span Эту страницу можно закрыть, а при необходимости, войти с другого устройства с помощью ключа доступа, который был сохранён ранее.
      Loader
    template(v-else)
      p Произошла ошибка при регистрации. Пожалуйста, обратитесь в подержку для устранения проблемы.

</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useCurrentUserStore } from 'src/entities/User';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { Loader } from 'src/shared/ui/Loader';
import { useRegistratorStore } from 'src/entities/Registrator'
const store = useRegistratorStore()

const currentStep = store.steps.WaitingRegistration

const step = computed(() => store.state.step)
const interval = ref()

watch(step, (newValue) => {
  if (newValue === currentStep) {
    interval.value = setInterval(() => update(), 10000)
    update()
  }
})

const currentUser = useCurrentUserStore()

const participantAccount = computed(() => currentUser.participantAccount)

onMounted(() => {
  if (participantAccount.value && step.value === currentStep)
    store.next()
})

onBeforeUnmount(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})

const update = async () => {
  if (store.state.account.username && !participantAccount.value) {
    try {
      await currentUser.loadProfile(store.state.account.username, info.coopname)
    } catch(e: any){
      console.log('error: ', e.message)
    }
  } else {
    clearInterval(interval.value)
  }
}

watch(() => participantAccount, (newValue) => {
  if (newValue) store.next()
})


</script>
