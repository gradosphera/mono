<script setup lang="ts">
import { computed, withDefaults, ref } from 'vue'
import type { IStepProps } from '../model/types'
import { TariffSelector, type ITariff } from '../Tariffs'

const props = withDefaults(defineProps<IStepProps & {
  onContinue?: () => void
}>(), {})

const emits = defineEmits<{
  tariffSelected: [tariff: ITariff]
  tariffDeselected: []
}>()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const selectedTariff = ref<ITariff | null>(null)

const canContinue = computed(() => selectedTariff.value !== null)

const handleTariffSelected = (tariff: ITariff) => {
  selectedTariff.value = tariff
  emits('tariffSelected', tariff)
}

const handleTariffDeselected = () => {
  selectedTariff.value = null
  emits('tariffDeselected')
}

const handleContinue = () => {
  if (canContinue.value && props.onContinue) {
    props.onContinue()
  }
}
</script>

<template lang="pug">
q-step(
  :name="1"
  title="Выберите тариф"
  icon="info"
  :done="isDone"
)
  .q-pa-md

    TariffSelector(
      :disabled="!isActive"
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
