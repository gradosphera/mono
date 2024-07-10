<template lang="pug">
div
  q-step(
    :name="7"
    title="Получите решение совета о приёме Вас в пайщики кооператива"
    :done="step > 7"
  )

    p Ожидаем, когда совет рассмотрит Ваше заявление и примет решение о приёме Вас в пайщики. Это может занять до 24 часов. Вы получите уведомление, когда решение будет принято. Эту страницу можно закрыть, а при необходимости, войти с другого устройства с помощью ключа доступа, который был сохранён ранее.
    Loader

  </template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { createUserStore as store } from 'src/features/User/CreateUser'
import { useCurrentUserStore } from 'src/entities/User';
import { COOPNAME } from 'src/shared/config';
import { Loader } from 'src/shared/ui/Loader';

const props = defineProps({
  step: {
    type: Number,
    required: true
  }
})

const currentStep = 7
const step = computed(() => props.step)
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
    store.step++
})

onBeforeUnmount(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})

const update = () => {
  console.log('pn start upate')
  if (store.account.username && !participantAccount.value) {
    console.log('on update')
    currentUser.loadProfile(store.account.username, COOPNAME)
  } else {
    clearInterval(interval.value)
  }
}

watch(() => participantAccount, (newValue) => {
  if (newValue){
    console.log('on wating move')
    store.step++
  }

})


</script>
