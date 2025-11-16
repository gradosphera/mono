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
  .form-step-container.q-pa-md

    //- Заголовок шага
    .step-header.q-mb-xl
      .text-h6.form-title Настройка параметров кооператива
      .subtitle.text-body2.text-grey-7.q-mt-sm
        | Заполните основные параметры для запуска вашего Цифрового Кооператива

    //- Форма ввода данных
    CooperativeDataForm(
      @continue="handleContinue"
      @back="handleBack"
    )
</template>

<style scoped>
.form-step-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

/* Адаптивность */
@media (max-width: 480px) {
  .form-step-container {
    padding: 1rem;
  }

  .step-header {
    margin-bottom: 1.5rem;
  }
}
</style>
