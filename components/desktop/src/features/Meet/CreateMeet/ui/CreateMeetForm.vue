<template lang="pug">
q-dialog(:model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent)
  q-card(style="min-width: 500px")
    q-card-section.row.items-center
      div.text-h6 Создать общее собрание {{ isChairman ? '(Председатель)' : '(Член совета)' }}
      q-space
      q-btn(icon="close" flat round dense v-close-popup @click="$emit('update:modelValue', false)")

    q-card-section
      q-form(@submit="handleSubmit")
        // Выбор типа собрания
        q-select(
          v-model="formData.type"
          :options="meetTypeOptions"
          label="Тип собрания"
          emit-value
          map-options
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )

        q-input(
          v-model="formData.presider"
          label="Имя аккаунта председателя собрания"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.secretary"
          label="Имя аккаунта секретаря собрания"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.open_at"
          :label="env.NODE_ENV === 'development' ? `Дата и время открытия (мин. через 1 минуту, ${timezoneLabel})` : `Дата и время открытия (мин. через 15 дней, ${timezoneLabel})`"
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
              v-model="point.decision"
              label="Проект Решения"
              :rules="[val => !!val || 'Обязательное поле']"
              dense
              type="textarea"
              autogrow
            )

          div.q-mb-sm
            q-input(
              v-model="point.context"
              label="Приложения"
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
import { reactive, computed, onMounted } from 'vue'
import { useAgendaPoints } from 'src/shared/hooks/useAgendaPoints'
import { getCurrentLocalDateForForm, convertLocalDateToUTC, getTimezoneLabel, getFutureDateForForm } from 'src/shared/lib/utils/dates/timezone'
import { env } from 'src/shared/config/Environment'
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';

// Определяем пропсы один раз
const props = defineProps<{
  modelValue: boolean,
  loading?: boolean,
  isChairman: boolean
}>()

// Отладочная информация при монтировании
onMounted(() => {
  console.log('CreateMeetForm mounted, isChairman:', props.isChairman)
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', data: any): void
}>()

// Название часового пояса для отображения в лейблах
const timezoneLabel = getTimezoneLabel()
const session = useSessionStore()
const system = useSystemStore()

// Делаем isChairman доступным в шаблоне напрямую для отладки
const isChairman = computed(() => {
  console.log('Вычисляемое свойство isChairman:', props.isChairman)
  return props.isChairman
})

// Опции для выбора типа собрания в зависимости от роли
const meetTypeOptions = computed(() => {
  // Выведем отладочную информацию, чтобы увидеть значение флага
  console.log('isChairman в форме для опций:', props.isChairman)

  // Председатель может выбирать любой тип
  if (props.isChairman) {
    return [
      { label: 'Очередное собрание', value: 'regular' },
      { label: 'Внеочередное собрание', value: 'extra' }
    ]
  }
  // Члены совета могут создавать только внеочередное
  return [
    { label: 'Внеочередное собрание', value: 'extra' }
  ]
})

// Форма для создания собрания
const formData = reactive(
  env.NODE_ENV === 'development'
    ? {
        coopname: system.info.coopname,
        initiator: session.username,
        presider: session.username,
        secretary: session.username,
        open_at: getCurrentLocalDateForForm(0.17), // ~10 секунд от текущего времени
        close_at: getCurrentLocalDateForForm(2), // 2 минуты от текущего времени
        username: session.username,
        type: props.isChairman ? 'regular' : 'extra', // Тип по умолчанию в зависимости от роли
        agenda_points: [
          {
            title: 'Тестовый вопрос',
            context: 'Тут приложения к вопросу',
            decision: 'Тут проект решения по вопросу',
          },
        ],
      }
    : {
        coopname: system.info.coopname,
        initiator: session.username,
        presider: '',
        secretary: '',
        open_at: getFutureDateForForm(15, 6, 0), // через 15 дней, 6:00
        close_at: getFutureDateForForm(18, 12, 0), // через 18 дней, 12:00
        username: session.username,
        type: props.isChairman ? 'regular' : 'extra', // Тип по умолчанию в зависимости от роли
        agenda_points: [
          // пустой массив, либо можно добавить пустой объект для вёрстки
        ],
      }
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
