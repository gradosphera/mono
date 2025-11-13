<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { TariffSelector, type ITariff } from '../Tariffs'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

const props = withDefaults(defineProps<IStepProps & {
  selectedTariff?: ITariff | null
}>(), {})

const connectionAgreement = useConnectionAgreementStore()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const selectedTariff = computed({
  get: () => props.selectedTariff || connectionAgreement.selectedTariff,
  set: (value) => connectionAgreement.setSelectedTariff(value)
})

const canContinue = computed(() => selectedTariff.value !== null)

const handleTariffSelected = (tariff: ITariff) => {
  selectedTariff.value = tariff
}

const handleTariffDeselected = () => {
  selectedTariff.value = null
}

const handleContinue = () => {
  if (canContinue.value && connectionAgreement.currentStep < 5) {
    connectionAgreement.setCurrentStep(connectionAgreement.currentStep + 1)
  }
}
</script>

<template lang="pug">
q-step(
  :name="1"
  title="Выбор тарифа подключения"
  icon="info"
  :done="isDone"
)
  .q-pa-md

    TariffSelector(
      :disabled="!isActive"
      :selected-tariff="selectedTariff"
      @tariff-selected="handleTariffSelected"
      @tariff-deselected="handleTariffDeselected"
    )

  q-stepper-navigation.q-gutter-sm
    q-btn(
      v-if="isActive"
      color="primary"
      :disable="!canContinue"
      label="Продолжить"
      @click="handleContinue"
    )
</template>
