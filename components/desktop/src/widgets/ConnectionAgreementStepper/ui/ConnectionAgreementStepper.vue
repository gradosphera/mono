<script setup lang="ts">
import { ref } from 'vue'
import { IntroStep, AgreementStep, FormStep, WaitingStep } from '../Steps/index'

const props = defineProps<{
  initialStep?: number
  isFinish: boolean
  signedDocument: any
  coop: any
  html?: string
  domainValid?: boolean | null
  installationProgress?: number | null
  instanceStatus?: string | null
  subscriptionsLoading?: boolean
  subscriptionsError?: string | null
}>()

const emits = defineEmits<{
  stepChange: [step: number]
  tariffSelected: [tariff: any]
  tariffDeselected: []
  continue: []
  sign: []
  finish: []
  reload: []
}>()

const currentStep = ref(props.initialStep || 1)

// Управление шагами
const goToNext = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    emits('stepChange', currentStep.value)
  }
}

const goToPrev = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    emits('stepChange', currentStep.value)
  }
}

const handleContinue = () => {
  goToNext()
  emits('continue')
}

const handleSign = () => {
  goToNext()
  emits('sign')
}

const handleFinish = () => {
  goToNext()
  emits('finish')
}

const handleReload = () => {
  emits('reload')
}

const handleTariffSelected = (tariff: any) => {
  emits('tariffSelected', tariff)
}

const handleTariffDeselected = () => {
  emits('tariffDeselected')
}
</script>

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
      @continue="handleContinue"
      @tariff-selected="handleTariffSelected"
      @tariff-deselected="handleTariffDeselected"
    )

    AgreementStep(
      :current-step="currentStep"
      :is-active="currentStep === 2"
      :is-done="currentStep > 2"
      :html="html"
      @back="goToPrev"
      @sign="handleSign"
    )

    FormStep(
      :current-step="currentStep"
      :is-active="currentStep === 3"
      :is-done="currentStep > 3"
      :signed-document="signedDocument"
      @back="goToPrev"
      @finish="handleFinish"
    )

    WaitingStep(
      :current-step="currentStep"
      :is-active="currentStep === 4"
      :is-done="false"
      :coop="coop"
      :domain-valid="domainValid"
      :installation-progress="installationProgress"
      :instance-status="instanceStatus"
      :subscriptions-loading="subscriptionsLoading"
      :subscriptions-error="subscriptionsError"
      @back="goToPrev"
      @reload="handleReload"
    )
</template>
