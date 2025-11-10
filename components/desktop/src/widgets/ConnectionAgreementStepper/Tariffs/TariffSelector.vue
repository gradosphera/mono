<script setup lang="ts">
import { ref, computed } from 'vue'
import { TariffCard, type ITariff } from './index'

// Доступные тарифы
const availableTariffs: ITariff[] = [
  {
    id: 'test',
    name: 'Тестовый',
    description: 'Единственный тариф на период бета-тестирования платформы',
    price: '1500 RUB',
    features: [
      '150 AXON на счёт кооператива',
      'достаточно для 100 пакетов документов',
      'и 50 регистраций пайщиков',
      'Хостинг на изолированном сервере',
      'Техническая поддержка'
    ],
    additionalCosts: [
      '5 AXON в день списывается со счёта кооператива',
      '1 AXON списывается за каждый пакет документов',
      '1 AXON списывается за регистрацию нового пайщика',
    ]
  }
]

const props = defineProps<{
  disabled?: boolean
  selectedTariff?: ITariff | null
}>()

const emits = defineEmits<{
  tariffSelected: [tariff: ITariff]
  tariffDeselected: []
}>()

const selectedTariffId = ref<string>(props.selectedTariff?.id || '')

const currentSelectedTariff = computed(() => {
  return availableTariffs.find(tariff => tariff.id === selectedTariffId.value)
})

const handleTariffSelect = (tariffId: string) => {
  selectedTariffId.value = tariffId
  const tariff = availableTariffs.find(t => t.id === tariffId)
  if (tariff) {
    emits('tariffSelected', tariff)
  }
}

const handleTariffDeselect = (tariffId: string) => {
  if (selectedTariffId.value === tariffId) {
    selectedTariffId.value = ''
    emits('tariffDeselected')
  }
}

// Экспортируем для использования в родительском компоненте
defineExpose({
  currentSelectedTariff,
  hasSelection: computed(() => !!selectedTariffId.value)
})
</script>

<template lang="pug">
div
  .text-center.q-mb-lg
    //- h5.text-h5.q-mb-sm Выберите тариф
    p.text-body2.text-grey-7 Выберите подходящий тариф для вашего кооператива

  .tariff-grid
    div(v-for="tariff in availableTariffs" :key="tariff.id")
      TariffCard(
        :tariff="tariff"
        :selected="selectedTariffId === tariff.id"
        :disabled="disabled"
        @select="handleTariffSelect"
        @deselect="handleTariffDeselect"
      )</template>

<style scoped>
.tariff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 599px) {
  .tariff-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
