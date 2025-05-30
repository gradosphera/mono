<template lang="pug">
q-dialog(:model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent)
  q-card(style="min-width: 500px")
    q-card-section.row.items-center
      div.text-h6 Создать общее собрание
      q-space
      q-btn(icon="close" flat round dense v-close-popup @click="$emit('update:modelValue', false)")

    q-card-section
      q-form(@submit="handleSubmit")
        q-input(
          v-model="formData.initiator"
          label="Инициатор"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.presider"
          label="Председатель"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.secretary"
          label="Секретарь"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.open_at"
          :label="`Дата и время открытия (${timezoneLabel})`"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.close_at"
          :label="`Дата и время закрытия (${timezoneLabel})`"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )

        div.text-h6.q-mt-md Повестка собрания

        q-card(flat bordered v-for="(point, index) in formData.agenda_points" :key="index").q-mb-lg.q-pa-sm
          div.row.items-center.q-mb-sm
            div.text-subtitle1.q-mr-md № {{ index + 1 }}
            div.col-auto
              q-btn(flat icon="delete" size="sm" color="grey" @click="removeAgendaPoint(index)")

          div.q-mb-sm
            q-input(
              v-model="point.title"
              label="Вопрос"
              :rules="[val => !!val || 'Обязательное поле']"
              dense
              type="textarea"
              autogrow
            )

          div.q-mb-sm
            q-input(
              v-model="point.context"
              label="Контекст"
              :rules="[val => !!val || 'Обязательное поле']"
              dense
              type="textarea"
              autogrow
            )

          div.q-mb-sm
            q-input(
              v-model="point.decision"
              label="Проект Решения"
              :rules="[val => !!val || 'Обязательное поле']"
              dense
              type="textarea"
              autogrow
            )

          q-separator(v-if="index < formData.agenda_points.length - 1")

        div.text-center.q-mb-md
          q-btn(outline label="Добавить пункт повестки" @click="addAgendaPoint")

    q-card-section.q-pt-none
      div.text-caption.text-grey При создании собрания будет сгенерирован документ повестки.

    q-card-actions(align="right")
      q-btn(flat label="Отмена" v-close-popup @click="$emit('update:modelValue', false)" :disable="loading")
      q-btn(color="primary" label="Создать" type="submit" @click="handleSubmit" :loading="loading" )
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAgendaPoints } from 'src/shared/hooks/useAgendaPoints'
import { getCurrentLocalDateForForm, convertLocalDateToUTC, getTimezoneLabel } from 'src/shared/lib/utils/dates/timezone'

defineProps<{
  modelValue: boolean,
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', data: any): void
}>()

// Название часового пояса для отображения в лейблах
const timezoneLabel = getTimezoneLabel()

// Форма для создания собрания
const formData = reactive(
  {
    'coopname': 'voskhod',
    'initiator': 'ant',
    'presider': 'ant',
    'secretary': 'ant',
    'open_at': getCurrentLocalDateForForm(0.17), // ~10 секунд от текущего времени
    'close_at': getCurrentLocalDateForForm(2), // 2 минуты от текущего времени
    'username': 'ant',
    'agenda_points': [
        {
            'title': 'test',
            'context': 'testt',
            'decision': 'testtt'
        }
    ]
}
// {
//   initiator: '',
//   presider: '',
//   secretary: '',
//   open_at: '',
//   close_at: '',
//   agenda_points: [{
//     title: '',
//     context: '',
//     decision: ''
//   }
// ]
// }
)

const { addAgendaPoint, removeAgendaPoint } = useAgendaPoints(formData.agenda_points)

const handleSubmit = () => {
  // Конвертируем локальные даты в UTC для отправки в блокчейн
  const dataToSend = {
    ...formData,
    open_at: convertLocalDateToUTC(formData.open_at),
    close_at: convertLocalDateToUTC(formData.close_at)
  }

  emit('create', dataToSend)
}
</script>
