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
          label="Новая дата и время открытия, UTC"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
          class="q-mb-md"
        )
        q-input(
          v-model="formData.new_close_at"
          label="Новая дата и время закрытия, UTC"
          type="datetime-local"
          :rules="[val => !!val || 'Обязательное поле']"
          dense
          class="q-mb-md"
        )

        div.text-subtitle1.q-mb-sm При перезапуске собрания будут использованы существующие пункты повестки:

        q-card(bordered flat v-if="meetStore.currentMeet?.processing?.questions?.length").q-pa-sm.q-my-sm.rounded-borders
          div.q-mb-md(v-for="(question, index) in meetStore.currentMeet.processing.questions" :key="index")
            div.text-caption.text-grey-6 {{ index + 1 }}. {{ question.title }}
            div.text-caption {{ question.context }}

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

const props = defineProps<{
  modelValue: boolean,
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'restart', data: any): void
}>()

const meetStore = useMeetStore()

// Форма для перезапуска собрания
const formData = reactive({
  new_open_at: new Date(Date.now() + 10000).toISOString().slice(0, 16),
  new_close_at: new Date(Date.now() + 60000).toISOString().slice(0, 16),
})


// Сброс формы при открытии диалога
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    formData.new_open_at = new Date(Date.now() + 10000).toISOString().slice(0, 16)
    formData.new_close_at = new Date(Date.now() + 60000).toISOString().slice(0, 16)
  }
})

const handleSubmit = () => {
  const meet = meetStore.currentMeet
  if (!meet) return

  // Проверяем наличие вопросов повестки
  if (!meet.processing?.questions || meet.processing.questions.length === 0) {
    return
  }

  emit('restart', {
    ...formData,
    agenda_points: meet.processing.questions.map(q => ({
      title: q.title,
      context: q.context,
      decision: q.decision
    }))
  })
}
</script>
