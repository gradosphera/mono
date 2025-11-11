<template lang="pug">
div
  q-stepper(
    :model-value="currentStep"
    flat
    vertical
    color="accent"
    animated
    done-color="teal"
  )
    IntroStep(
      :current-step="currentStep"
      :is-active="currentStep === 1"
      :is-done="currentStep > 1"
      :selected-tariff="selectedTariff"
    )

    FormStep(
      :current-step="currentStep"
      :is-active="currentStep === 2"
      :is-done="currentStep > 2"
      :document="document"
      :signed-document="signedDocument"
    )

    AgreementStep(
      :current-step="currentStep"
      :is-active="currentStep === 3"
      :is-done="currentStep > 3"
      :html="html"
    )

    DomainValidationStep(
      :current-step="currentStep"
      :is-active="currentStep === 4"
      :is-done="currentStep > 4"
      :coop="coop"
      :domain-valid="domainValid"
      :subscriptions-loading="subscriptionsLoading"
      :subscriptions-error="subscriptionsError"
    )

    WaitingStep(
      :current-step="currentStep"
      :is-active="currentStep === 5"
      :is-done="false"
      :coop="coop"
      :domain-valid="domainValid"
      :installation-progress="installationProgress"
      :instance-status="instanceStatus"
      :subscriptions-loading="subscriptionsLoading"
      :subscriptions-error="subscriptionsError"
    )
</template>


<script setup lang="ts">
import { computed, watch } from 'vue'
import { IntroStep, AgreementStep, FormStep, DomainValidationStep, WaitingStep } from '../Steps/index'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

defineProps<{
  coop?: any
  domainValid?: boolean | null
  installationProgress?: number | null
  instanceStatus?: string | null
  subscriptionsLoading?: boolean
  subscriptionsError?: string | null
}>()

const connectionAgreement = useConnectionAgreementStore()

// Данные из стора
const currentStep = computed(() => connectionAgreement.currentStep)
const selectedTariff = computed(() => connectionAgreement.selectedTariff)
const document = computed(() => connectionAgreement.document)
const signedDocument = computed(() => connectionAgreement.signedDocument)
const html = computed(() => document.value?.data?.html)

// Watch для реактивной генерации документа при переходе к шагу 3
watch(() => currentStep.value, async (newStep, oldStep) => {
  // Если переходим к шагу 3 (соглашение), всегда генерируем документ заново
  if (newStep === 3 && oldStep !== 3) {
    console.log('📝 Шаг 3: Генерируем соглашение')
    try {
      await connectionAgreement.generateDocument()
    } catch (error) {
      console.error('Ошибка генерации документа:', error)
    }
  }
})
</script>
