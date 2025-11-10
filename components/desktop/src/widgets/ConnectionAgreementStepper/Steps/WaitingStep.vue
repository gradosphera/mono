<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { copyToClipboard } from 'quasar'
import { SuccessAlert } from 'src/shared/api'

const props = withDefaults(defineProps<IStepProps & {
  coop?: any
  domainValid?: boolean | null
  installationProgress?: number | null
  instanceStatus?: string | null
  subscriptionsLoading?: boolean
  subscriptionsError?: string | null
  onReload?: () => void
  onBack?: () => void
}>(), {
  domainValid: null,
  installationProgress: null,
  instanceStatus: null,
  subscriptionsLoading: false,
  subscriptionsError: null
})

const emits = defineEmits<{
  back: []
  reload: []
}>()

const isDone = computed(() => props.isDone)

const handleBack = () => {
  emits('back')
}

const handleReload = () => {
  emits('reload')
}

const instruction = computed(() => `Создайте A-запись домена ${props.coop?.announce} на IP-адрес: 51.250.114.13`)

const copy = () => {
  copyToClipboard(instruction.value)
    .then(() => {
      SuccessAlert('Инструкция скопирована в буфер')
    })
    .catch((e) => {
      console.log(e)
    })
}
</script>

<template lang="pug">
q-step(
  :name="4"
  title="Установка кооператива"
  icon="hourglass_top"
  :done="isDone"
)
  .q-pa-md
    p.text-h6.q-mb-md Кооператив на подключении
    p.q-mb-md Статус:
      q-badge(
        v-if="coop?.status == 'pending'"
        color="orange"
      ).q-ml-sm ожидание
      q-badge(
        v-if="coop?.status == 'active'"
        color="teal"
      ).q-ml-sm активен
      q-badge(
        v-if="coop?.status == 'blocked'"
        color="red"
      ).q-ml-sm заблокирован

    q-btn(
      color="grey-6"
      size="sm"
      flat
      label="Назад"
      @click="handleBack"
    )
    q-btn(
      color="primary"
      size="sm"
      icon="refresh"
      @click="handleReload"
    ).q-ml-md
      span обновить

    .q-mt-md
      p.text-subtitle1 Статус подписки на хостинг:

      div.flex.items-center.q-gutter-sm.q-mt-sm
        div
          span.text-body2 Валидность домена:
          q-badge(
            v-if="domainValid === true"
            color="green"
          ).q-ml-sm валиден
          q-badge(
            v-if="domainValid === false"
            color="red"
          ).q-ml-sm не валиден
          q-badge(
            v-if="domainValid === null && !subscriptionsLoading"
            color="grey"
          ).q-ml-sm неизвестно
          q-badge(
            v-if="subscriptionsLoading"
            color="blue"
          ).q-ml-sm загрузка...

        div
          span.text-body2 Прогресс установки:
          q-badge(
            v-if="installationProgress !== null"
            :color="installationProgress === 100 ? 'green' : 'orange'"
          ).q-ml-sm {{ installationProgress }}%
          q-badge(
            v-if="installationProgress === null && !subscriptionsLoading"
            color="grey"
          ).q-ml-sm неизвестно
          q-badge(
            v-if="subscriptionsLoading"
            color="blue"
          ).q-ml-sm загрузка...

        div
          span.text-body2 Статус сервера:
          q-badge(
            v-if="instanceStatus"
            :color="instanceStatus === 'active' ? 'green' : instanceStatus === 'error' ? 'red' : 'orange'"
          ).q-ml-sm {{ instanceStatus }}
          q-badge(
            v-if="!instanceStatus && !subscriptionsLoading"
            color="grey"
          ).q-ml-sm неизвестно
          q-badge(
            v-if="subscriptionsLoading"
            color="blue"
          ).q-ml-sm загрузка...

    .q-mt-md
      div(
        v-if="subscriptionsError"
      ).q-mb-md
        q-banner(
          :class="'text-white bg-red-500'"
          rounded
        )
          template(v-slot:avatar)
            q-icon(name="error" color="white")
          span {{ subscriptionsError }}

    p.q-mt-md
      | Пожалуйста, перешлите инструкцию ниже вашему техническому специалисту. После её выполнения, мы автоматически выполним запуск. Далее, Вам необходимо завершить установку уже на Вашем сайте следуя инструкциям, представленным там.

    q-card(flat bordered).q-pa-sm.q-mt-md
      p.text-bold Инструкция
      div.flex.justify-between
        span {{ instruction }}
        q-btn(size="sm" icon="fas fa-copy" flat @click="copy")
</template>
