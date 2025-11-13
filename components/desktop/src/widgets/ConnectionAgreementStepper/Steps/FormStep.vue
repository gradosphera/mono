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

  // Сохраняем данные формы в стор
  if (formData) {
    connectionAgreement.setFormData(formData)
  }

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
  title="Параметры кооператива"
  icon="settings"
  :done="isDone"
)
  .q-pa-md
    CooperativeDataForm(
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
