<script setup lang="ts">
import { withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { AddCooperativeForm } from 'src/features/Union/AddCooperative'

withDefaults(defineProps<IStepProps & {
  signedDocument?: any
  onFinish?: () => void
  onBack?: () => void
}>(), {})

const emits = defineEmits<{
  back: []
  finish: []
}>()

const handleFinish = () => {
  emits('finish')
}

const handleBack = () => {
  emits('back')
}
</script>

<template lang="pug">
q-step(
  :name="3"
  title="Настройка кооператива"
  icon="settings"
  :done="isDone"
)
  .q-pa-md
    p.text-h6.q-mb-md Предварительная настройка
    p.q-mb-md
      | Пожалуйста, укажите домен для установки Цифрового Кооператива. Также, укажите суммы вступительных и минимальных паевых взносов для физических лиц, юридических лиц и индивидуальных предпринимателей:

    AddCooperativeForm(
      v-if="signedDocument"
      :document="signedDocument"
      @finish="handleFinish"
    )

  q-stepper-navigation.q-gutter-sm(v-if="signedDocument")
    q-btn(
      color="grey-6"
      flat
      label="Назад"
      @click="handleBack"
    )
</template>
