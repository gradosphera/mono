<template lang="pug">
  q-step(
    :name="4"
    title="Проверка домена"
    icon="domain"
    :done="isDone"
  )
    .q-pa-md
      .text-h6.q-mb-md Проверка домена {{ coop?.announce }}

      .q-mb-lg
        p.text-body1.q-mb-md
          | Для запуска вашего кооператива необходимо настроить домен. Пожалуйста, следуйте инструкции ниже:

        q-card(flat bordered).q-pa-md.q-mb-md
          .text-subtitle1.q-mb-sm Инструкция по настройке домена:
          ol.q-pl-md
            li.q-mb-sm Перейдите в панель управления вашим доменом
            li.q-mb-sm Создайте A-запись для домена {{ coop?.announce }}
            li.q-mb-sm Укажите IP-адрес: 51.250.114.13
            li.q-mb-sm Сохраните изменения
            li.q-mb-sm Дождитесь обновления DNS (может занять до 24 часов)

        .flex.justify-between.items-center.q-mb-md
          span.text-body2 Статус проверки домена:
          q-badge(
            v-if="domainValid === true"
            color="green"
          ) валиден ✓
          q-badge(
            v-if="domainValid === false"
            color="red"
          ) не валиден ✗
          q-badge(
            v-if="domainValid === null && !subscriptionsLoading"
            color="grey"
          ) проверка...
          q-badge(
            v-if="subscriptionsLoading"
            color="blue"
          ) загрузка...

      .q-mt-md
        div(v-if="domainValid === false").q-mb-md
          q-banner(
            class="text-white bg-orange-500"
            rounded
          )
            template(v-slot:avatar)
              q-icon(name="warning" color="white")
            span Домен еще не настроен или DNS не обновился. Повторите проверку через некоторое время.

        div(v-if="domainValid === true").q-mb-md
          q-banner(
            class="text-white bg-green-500"
            rounded
          )
            template(v-slot:avatar)
              q-icon(name="check_circle" color="white")
            span Отлично! Домен настроен правильно. Переходим к следующему шагу...

      .flex.justify-between.q-gutter-sm
        q-btn(
          color="grey-6"
          flat
          label="Назад"
          @click="handleBack"
        )
        q-btn(
          color="primary"
          :disable="domainValid !== true"
          label="Продолжить"
          @click="handleContinue"
        )
        q-btn(
          color="grey-6"
          size="sm"
          flat
          icon="refresh"
          @click="handleReload"
        )
          span обновить
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'

const props = withDefaults(defineProps<IStepProps & {
  coop?: any
  domainValid?: boolean | null
  subscriptionsLoading?: boolean
  subscriptionsError?: string | null
  onReload?: () => void
  onBack?: () => void
  onContinue?: () => void
}>(), {
  domainValid: null,
  subscriptionsLoading: false,
  subscriptionsError: null
})

const emits = defineEmits<{
  back: []
  continue: []
  reload: []
}>()

const isDone = computed(() => props.isDone)

const handleBack = () => {
  emits('back')
}

const handleContinue = () => {
  emits('continue')
}

const handleReload = () => {
  emits('reload')
}
</script>
