<template lang="pug">
div
  q-step(
    :name="store.steps.Welcome"
    :title="'Добро пожаловать в ' + COOP_SHORT_NAME"
    :done="store.isStepDone('Welcome')"
  )

    p Совет кооператива {{ COOP_SHORT_NAME }} принял положительное решение о приёме Вас в пайщики, выдал удостоверение и создал цифровой кошелёк для Вас.

    div.q-mt-lg
      q-btn(
        color="primary"
        label="Открыть кошелёк"
        @click="next"
      ).q-mt-lg.q-mb-lg
  </template>

<script lang="ts" setup>
import { COOP_SHORT_NAME } from 'src/shared/config'
import { useRouter } from 'vue-router';
import { useRegistratorStore } from 'src/entities/Registrator';
const router = useRouter()
const store = useRegistratorStore()

const next = () => {
  router.push({ name: 'index' })
}

</script>
