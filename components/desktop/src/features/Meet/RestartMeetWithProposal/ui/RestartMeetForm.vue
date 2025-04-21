<template lang="pug">
q-dialog(:model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent)
  q-card(style="min-width: 500px")
    q-card-section.row.items-center
      div.text-h6 Перезапустить собрание
      q-space
      q-btn(icon="close" flat round dense v-close-popup @click="$emit('update:modelValue', false)")
    q-card-section
      q-form(@submit="handleSubmit")
        q-input(
          v-model="formData.new_open_at"
          label="Новая дата открытия"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )
        q-input(
          v-model="formData.new_close_at"
          label="Новая дата закрытия"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
        )

        div.text-h6.q-mt-md Новая повестка собрания

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

    q-card-actions(align="right")
      q-btn(flat label="Отмена" v-close-popup @click="$emit('update:modelValue', false)" :disable="loading")
      q-btn(color="primary" label="Перезапустить" type="submit" @click="handleSubmit" :loading="loading")
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useAgendaPoints } from 'src/shared/hooks/useAgendaPoints'
import type { IMeet } from 'src/entities/Meet'

const props = defineProps<{
  modelValue: boolean,
  meet: IMeet | null,
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'restart', data: any): void
}>()

// Форма для перезапуска собрания
const formData = reactive({
  new_open_at: '',
  new_close_at: '',
  agenda_points: [{
    title: '',
    context: '',
    decision: ''
  }]
})

const { addAgendaPoint, removeAgendaPoint } = useAgendaPoints(formData.agenda_points)

// Сброс формы при открытии диалога
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    formData.new_open_at = ''
    formData.new_close_at = ''
    formData.agenda_points = [{
      title: '',
      context: '',
      decision: ''
    }]
  }
})

const handleSubmit = () => {
  if (!props.meet) return

  emit('restart', {
    ...formData,
    hash: props.meet.hash
  })
}
</script>
