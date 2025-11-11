<script setup lang="ts">
import { withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { CooperativeDataForm } from 'src/features/Union/CooperativeDataForm'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

withDefaults(defineProps<IStepProps & {
  document?: any
  signedDocument?: any
}>(), {})

const connectionAgreement = useConnectionAgreementStore()

const handleContinue = (formData?: any) => {
  console.log('📝 FormStep: Продолжаем с данными формы:', formData)

  // Сохраняем данные формы в стор (уже сохранены напрямую)
  // Переходим к следующему шагу (документ сгенерируется в watch)
  if (connectionAgreement.currentStep < 5) {
    connectionAgreement.setCurrentStep(connectionAgreement.currentStep + 1)
  }
}

const handleBack = () => {
  if (connectionAgreement.currentStep > 1) {
    connectionAgreement.setCurrentStep(connectionAgreement.currentStep - 1)
  }
}
</script>

<template lang="pug">
q-step(
  :name="2"
  title="Сбор данных"
  icon="settings"
  :done="isDone"
)
  .q-pa-md
    p.q-pb-md Введите домен для запуска сайта Цифрового Кооператива. Также, укажите суммы вступительных и минимальных паевых взносов для физических лиц, юридических лиц и индивидуальных предпринимателей:

    CooperativeDataForm(
      :key="Date.now()"
      @continue="handleContinue"
    )

  q-stepper-navigation.q-gutter-sm
    q-btn(
      color="grey-6"
      flat
      label="Назад"
      @click="handleBack"
    )
</template>
