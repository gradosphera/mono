<template lang="pug">
  q-step(
    :name="5"
    title="Установка и настройка"
    icon="build"
    :done="isDone"
  )
    .q-pa-md
      .text-h6.q-mb-lg Установка кооператива

      .q-mb-lg
        p.text-body1.q-mb-md Статус кооператива:
        q-badge(
          v-if="coop?.status == 'pending'"
          color="orange"
        ).q-ml-sm ожидание одобрения
        q-badge(
          v-if="coop?.status == 'active'"
          color="teal"
        ).q-ml-sm активен
        q-badge(
          v-if="coop?.status == 'blocked'"
          color="red"
        ).q-ml-sm заблокирован

      .q-mb-lg(v-if="coop?.status === 'pending'")
        q-banner(
          class="bg-blue-50 text-blue-800 border-blue-200"
          rounded
          bordered
        )
          template(v-slot:avatar)
            q-icon(name="info" color="blue")
          .text-body2
            | Установка кооператива начнется после того, как союз потребительских обществ примет положительное решение о вашем подключении. Пожалуйста, ожидайте.

      .q-mb-lg(v-if="coop?.status === 'active'")
        .text-subtitle1.q-mb-md Прогресс установки:
        q-linear-progress(
          :value="installationProgress !== null ? installationProgress / 100 : 0"
          color="primary"
          size="8px"
          rounded
          class="q-mb-sm"
        )
        .text-center.text-caption.q-mb-md
          | {{ installationProgress !== null ? installationProgress : 0 }}% завершено

        p.text-body2.q-mb-md
          | Когда установка будет завершена, вы получите уведомление и сможете перейти к настройке вашего кооператива.

      .flex.justify-between.q-gutter-sm.q-mt-lg
      q-btn(
        color="grey-6"
        flat
        label="Назад"
        @click="handleBack"
      )
      q-btn(
        color="primary"
        size="sm"
        icon="refresh"
        @click="handleReload"
        )
          span.q-ml-sm Обновить статус

      .q-mt-lg(v-if="subscriptionsError")
          q-banner(
          class="text-white bg-red-500"
            rounded
          )
            template(v-slot:avatar)
              q-icon(name="error" color="white")
            span {{ subscriptionsError }}
  </template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'

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
</script>

