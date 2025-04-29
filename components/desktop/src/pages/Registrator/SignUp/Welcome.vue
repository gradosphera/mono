<template lang="pug">
div
  q-step(
    :name="store.steps.Welcome"
    :title="'Добро пожаловать в ' + coopTitle"
    :done="store.isStepDone('Welcome')"
  )

    p Совет кооператива {{ coopTitle }} принял положительное решение о приёме Вас в пайщики, выдал удостоверение и создал цифровой кошелёк для Вас.

    div.q-mt-lg
      q-btn(
        color="primary"
        label="Открыть кошелёк"
        @click="next"
      ).q-mt-lg.q-mb-lg
  </template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router';
import { useRegistratorStore } from 'src/entities/Registrator';
const router = useRouter()
const store = useRegistratorStore()
const coopTitle = computed(() => process.env.COOP_SHORT_NAME)

const next = () => {
  router.push({ name: 'index' })
}

</script>
