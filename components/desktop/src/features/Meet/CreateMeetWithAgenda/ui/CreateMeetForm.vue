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
          label="Дата открытия"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.close_at"
          label="Дата закрытия"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )

        div.text-h6.q-mt-md Повестка собрания

        div(v-for="(point, index) in formData.agenda_points" :key="index")
          div.row.q-mb-sm
            div.col
              q-input(
                v-model="point.title"
                label="Заголовок"
                :rules="[val => !!val || 'Обязательное поле']"
                dense
              )
            div.col
              q-input(
                v-model="point.context"
                label="Описание"
                :rules="[val => !!val || 'Обязательное поле']"
                dense
              )
            div.col
              q-input(
                v-model="point.decision"
                label="Решение"
                :rules="[val => !!val || 'Обязательное поле']"
                dense
              )
            div.col-auto
              q-btn(flat icon="delete" @click="removeAgendaPoint(index)")

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

defineProps<{
  modelValue: boolean,
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', data: any): void
}>()

// Форма для создания собрания

const formData = reactive(
  {
    'coopname': 'voskhod',
    'initiator': 'ant',
    'presider': 'ant',
    'secretary': 'ant',
    'open_at': '2026-02-02T12:12',
    'close_at': '2026-02-02T12:13',
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
  emit('create', formData)
}
</script>
