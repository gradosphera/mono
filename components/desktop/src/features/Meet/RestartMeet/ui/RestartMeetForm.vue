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

        div.q-pa-sm.q-my-sm.bg-grey-2.rounded-borders(v-if="meet?.processing?.questions?.length")
          div.q-mb-md(v-for="(question, index) in meet.processing.questions" :key="index")
            div.text-weight-bold {{ question.title }}
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
        :disable="!meet?.processing?.questions?.length"
      )
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
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
  new_close_at: ''
})

// Сброс формы при открытии диалога
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    formData.new_open_at = ''
    formData.new_close_at = ''
  }
})

const handleSubmit = () => {
  if (!props.meet) return
  
  // Проверяем наличие вопросов повестки
  if (!props.meet.processing?.questions || props.meet.processing.questions.length === 0) {
    return
  }

  emit('restart', {
    ...formData,
    hash: props.meet.hash
  })
}
</script>
