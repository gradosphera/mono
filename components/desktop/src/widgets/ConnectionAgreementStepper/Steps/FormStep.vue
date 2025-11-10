<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { AddCooperativeForm } from 'src/features/Union/AddCooperative'

const props = withDefaults(defineProps<IStepProps & {
  document?: any
  signedDocument?: any
  cooperative?: any
  onFinish?: () => void
  onBack?: () => void
}>(), {})

// Используем подписанный документ, если он есть, иначе обычный документ
const documentToUse = computed(() => props.signedDocument || props.document)

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
    p.q-pb-md Введите домен для запуска сайта Цифрового Кооператива. Также, укажите суммы вступительных и минимальных паевых взносов для физических лиц, юридических лиц и индивидуальных предпринимателей:

    AddCooperativeForm(
      v-if="documentToUse"
      :document="documentToUse"
      :cooperative="cooperative"
      @finish="handleFinish"
    )

  q-stepper-navigation.q-gutter-sm(v-if="documentToUse")
    q-btn(
      color="grey-6"
      flat
      label="Назад"
      @click="handleBack"
    )
</template>
