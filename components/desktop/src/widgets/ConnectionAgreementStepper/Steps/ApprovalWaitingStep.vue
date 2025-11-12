<template lang="pug">
  q-step(
    :name="5"
    title="Ожидание подтверждения"
    icon="schedule"
    :done="isDone"
  )
    .q-pa-md
      //- Успех - готово к установке
      .flex.column.items-center.q-pa-lg
        q-icon(name="check_circle" color="positive" size="64px").q-mb-md
        .text-h6.text-center.q-mb-md Техническая подготовка завершена
        .text-body1.text-center.text-grey-7.q-mb-xl
          | Ваш кооператив готов к установке

      //- Информационная карточка
      q-card(flat).q-mb-lg.bg-grey-1
        q-card-section.q-pa-lg
          .text-subtitle2.q-mb-md.text-weight-medium Ожидание подтверждения
          .text-body2.text-grey-8.q-mb-lg
            | Все готово к установке, но мы ожидаем поступления подтверждения от союза о вашем членстве.

          .text-body2.text-grey-7.q-mb-md
            | Как только союз подтвердит ваше членство, статус изменится автоматически и установка начнется.

          .text-body2.text-grey-7
            | Приблизительное время установки после получения подтверждения:
            strong.text-primary 60 минут

      //- Статус подтверждения
      .flex.justify-center.q-mb-lg
        q-chip(
          :color="getBlockchainStatusColor"
          text-color="white"
          size="md"
          :icon="instance?.blockchain_status === 'active' ? 'check_circle' : 'schedule'"
        )
          span {{ getBlockchainStatusText }}

      //- Навигация
      q-stepper-navigation.q-gutter-sm
        q-btn(
          color="grey-6"
          flat
          label="Назад"
          @click="handleBack"
        )
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

const props = withDefaults(defineProps<IStepProps>(), {})

const connectionAgreement = useConnectionAgreementStore()

// Получаем данные напрямую из store
const instance = computed(() => connectionAgreement.currentInstance)

const isDone = computed(() => props.isDone)

// Цвет статуса блокчейна
const getBlockchainStatusColor = computed(() => {
  if (instance.value?.blockchain_status === 'active') return 'positive'
  return 'info'
})

// Текст статуса блокчейна
const getBlockchainStatusText = computed(() => {
  if (instance.value?.blockchain_status === 'active') return 'Подтверждено'
  if (instance.value?.blockchain_status === 'pending') return 'Ожидание подтверждения'
  return 'Не подтверждено'
})

const handleBack = () => {
  connectionAgreement.setCurrentStep(2)
}
</script>

