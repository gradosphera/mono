<template lang="pug">
q-dialog(:model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent)
  q-card(style="min-width: 500px")
    q-card-section.row.items-center
      div.text-h6 Перезапустить собрание
      q-space
      q-btn(icon="close" flat round dense v-close-popup @click="$emit('update:modelValue', false)")
    q-card-section
      q-form(@submit="handleSubmit")
        div.text-subtitle1.q-mb-sm Выберите новые даты для собрания
        q-input(
          v-model="formData.new_open_at"
          :label="env.NODE_ENV === 'development' ? `Новая дата и время открытия (мин. через 1 минуту, ${timezoneLabel})` : `Новая дата и время открытия (мин. через 15 дней, ${timezoneLabel})`"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
          class="q-mb-md"
        )
        q-input(
          v-model="formData.new_close_at"
          :label="`Новая дата и время закрытия (${timezoneLabel})`"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
          class="q-mb-md"
        )

        div.text-subtitle1.q-mb-sm При перезапуске собрания будут использованы существующие пункты повестки:

        q-card(bordered flat v-if="meetStore.currentMeet?.processing?.questions?.length").q-pa-xs.q-my-sm.rounded-borders.bg-grey-1
          div.q-mb-xs.flex.items-start(v-for="(question, index) in meetStore.currentMeet.processing.questions" :key="index").q-mb-lg.q-pa-xs
            AgendaNumberAvatar(:number="index + 1" size="22px" class="q-mr-xs")
            div.col
              div.text-body2.text-weight-medium.q-mb-2 {{ question.title }}
              div.text-caption.q-mb-1.q-mt-md
                span.text-weight-bold.text-black Проект решения:
                span.text-black.q-ml-xs {{question.decision }}
              div.text-caption.q-mt-md
                span.text-weight-bold.text-black Приложения:
                span.text-black(v-if="question.context" v-html="parseLinks(question.context)").q-ml-xs
                span.text-black(v-else) —

        div.q-pa-sm.q-my-sm.bg-red-1.text-red-8.rounded-borders(v-else)
          div.text-center Вопросы повестки не найдены

    q-card-actions(align="right")
      q-btn(flat label="Отмена" v-close-popup @click="$emit('update:modelValue', false)" :disable="loading")
      q-btn(
        color="primary"
        label="Перезапустить"
        type="submit"
        @click="handleSubmit"
        :loading="loading"
        :disable="!meetStore.currentMeet?.processing?.questions?.length"
      )
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useMeetStore } from 'src/entities/Meet'
import { getCurrentLocalDateForForm, convertLocalDateToUTC, getTimezoneLabel, getFutureDateForForm } from 'src/shared/lib/utils/dates/timezone'
import { env } from 'src/shared/config/Environment'
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar'
import { parseLinks } from 'src/shared/lib/utils'
const props = defineProps<{
  modelValue: boolean,
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'restart', data: any): void
}>()

const meetStore = useMeetStore()

// Название часового пояса для отображения в лейблах
const timezoneLabel = getTimezoneLabel()

// Форма для перезапуска собрания
const formData = reactive(
  env.NODE_ENV === 'development'
    ? {
        new_open_at: getCurrentLocalDateForForm(0.17),
        new_close_at: getCurrentLocalDateForForm(1),
      }
    : {
        new_open_at: getFutureDateForForm(15, 6, 0),
        new_close_at: getFutureDateForForm(18, 12, 0),
      }
)

// Сброс формы при открытии диалога
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (env.NODE_ENV === 'development') {
      formData.new_open_at = getCurrentLocalDateForForm(0.17)
      formData.new_close_at = getCurrentLocalDateForForm(1)
    } else {
      formData.new_open_at = getFutureDateForForm(15, 6, 0)
      formData.new_close_at = getFutureDateForForm(18, 12, 0)
    }
  }
})

const handleSubmit = () => {
  const meet = meetStore.currentMeet
  if (!meet) return

  // Проверяем наличие вопросов повестки
  if (!meet.processing?.questions || meet.processing.questions.length === 0) {
    return
  }

  // Конвертируем локальные даты в UTC для отправки в блокчейн
  const dataToSend = {
    new_open_at: convertLocalDateToUTC(formData.new_open_at),
    new_close_at: convertLocalDateToUTC(formData.new_close_at),
    agenda_points: meet.processing.questions.map(q => ({
      title: q.title,
      context: q.context,
      decision: q.decision
    }))
  }

  emit('restart', dataToSend)
}
</script>
