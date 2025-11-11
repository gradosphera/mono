<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader'
import { Loader } from 'src/shared/ui/Loader'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

const props = withDefaults(defineProps<IStepProps & {
  html?: string
}>(), {})

const connectionAgreement = useConnectionAgreementStore()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const handleSign = async () => {
  try {
    await connectionAgreement.signDocument()
    // Переходим к следующему шагу после подписания
    if (connectionAgreement.currentStep < 5) {
      connectionAgreement.setCurrentStep(connectionAgreement.currentStep + 1)
    }
  } catch (error) {
    console.error('Ошибка подписания документа:', error)
  }
}

const handleBack = () => {
  // Специальная логика для возврата - очищаем подписанный документ
  console.log(`⬅️ AgreementStep: Возврат с шага ${connectionAgreement.currentStep}`)

  // Очищаем подписанный документ без генерации нового
  connectionAgreement.setSignedDocument(null)

  if (connectionAgreement.currentStep > 1) {
    connectionAgreement.setCurrentStep(connectionAgreement.currentStep - 1)
  }
}
</script>

<template lang="pug">
q-step(
  :name="3"
  title="Соглашение о подключении"
  icon="description"
  :done="isDone"
)
  .q-pa-md
    template(v-if="html")
      DocumentHtmlReader(:html="html")
    template(v-else)
      Loader(:text='`Готовим соглашение...`')

  q-stepper-navigation.q-gutter-sm(v-if="html")
    q-btn(
      v-if="isActive"
      color="grey-6"
      flat
      label="Назад"
      @click="handleBack"
    )
    q-btn(
      v-if="isActive"
      color="primary"
      label="Подписать"
      @click="handleSign"
    )
</template>
