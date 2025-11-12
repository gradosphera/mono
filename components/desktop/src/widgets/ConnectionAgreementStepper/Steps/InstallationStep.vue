<template lang="pug">
  q-step(
    :name="6"
    title="Установка"
    icon="cloud_download"
    :done="isDone"
  )
    .q-pa-md
      //- Установка в процессе
      div(v-if="instance?.progress < 100")
        .text-h6.text-center.q-mb-lg Установка платформы

        //- Стильный прогресс-бар
        .q-mb-lg.q-px-md
          q-linear-progress(
            :value="instance?.progress / 100 || 0"
            color="primary"
            size="24px"
            rounded
            class="q-mb-md"
          )
            .absolute-full.flex.flex-center
              .text-body2.text-white.text-weight-medium {{ instance?.progress || 0 }}%

        //- Информационные тексты в стиле Windows
        q-card(flat).q-mb-lg.bg-grey-1
          q-card-section.q-pa-lg
            .text-body2.text-grey-8.q-mb-md(v-if="instance?.progress < 20")
              q-icon(name="settings" color="primary" size="20px").q-mr-sm
              | Подготовка серверного окружения...
            .text-body2.text-grey-8.q-mb-md(v-else-if="instance?.progress < 40")
              q-icon(name="download" color="primary" size="20px").q-mr-sm
              | Загрузка компонентов платформы...
            .text-body2.text-grey-8.q-mb-md(v-else-if="instance?.progress < 60")
              q-icon(name="storage" color="primary" size="20px").q-mr-sm
              | Настройка базы данных и хранилищ...
            .text-body2.text-grey-8.q-mb-md(v-else-if="instance?.progress < 80")
              q-icon(name="security" color="primary" size="20px").q-mr-sm
              | Конфигурация блокчейн-интеграции...
            .text-body2.text-grey-8.q-mb-md(v-else)
              q-icon(name="check_circle" color="primary" size="20px").q-mr-sm
              | Финализация установки...

            .text-caption.text-grey-6.q-mt-md
              | Платформа кооперативной экономики объединяет цифровые инструменты для управления, учета и взаимодействия членов кооператива.

        .text-body2.text-center.text-grey-7
          | Приблизительное время: 60 минут

      //- Установка завершена
      div(v-else)
        .flex.column.items-center.q-pa-lg
          q-icon(name="celebration" color="positive" size="96px").q-mb-lg
          .text-h5.text-center.q-mb-md.text-positive Установка завершена!
          .text-body1.text-center.text-grey-7.q-mb-xl
            | Ваш кооператив успешно развернут и готов к работе

        //- Информация о следующих шагах
        q-card(flat).q-mb-lg.bg-grey-1
          q-card-section.q-pa-lg
            .text-subtitle2.q-mb-md.text-weight-medium Дашборд подключения
            .text-body2.text-grey-8.q-mb-md
              | Дашборд откроется автоматически через несколько секунд. Здесь вы сможете управлять подписками, просматривать баланс кошелька AXON и настраивать параметры платформы.

      //- Навигация (только кнопка назад, если установка не завершена)
      q-stepper-navigation.q-gutter-sm(v-if="instance?.progress < 100")
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

const handleBack = () => {
  connectionAgreement.setCurrentStep(2)
}
</script>


