<template lang="pug">
q-input(
  :id='id'
  :label='labelText'
  :model-value='value'
  :placeholder='placeholder'
  :readonly='readOnly'
  :disable='readOnly'
  :mask='mask'
  :fill-mask='fillMask'
  :hint='hint'
  :error='showError'
  :error-message='errorText'
  :rules='rules'
  lazy-rules='ondemand'
  dense
  outlined
  @update:model-value='v => emit("update:value", String(v ?? ""))'
)
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  label: string
  value: string
  placeholder?: string
  readOnly?: boolean
  /** Поле обязательно; пустое значение → красный outline + «Обязательно». */
  required?: boolean
  /** Quasar mask, напр. `###-###-######` для рег.номера СФР */
  mask?: string
  /** Подставлять плейсхолдеры маски при вводе */
  fillMask?: boolean
  /** Подсказка под полем */
  hint?: string
}>()

const emit = defineEmits<{ 'update:value': [value: string] }>()

const isEmpty = computed(() => !props.value || props.value.trim() === '')

const showError = computed(() => !!props.required && !props.readOnly && isEmpty.value)

const errorText = computed(() => (showError.value ? 'Обязательное поле' : ''))

const labelText = computed(() => (props.required && !props.readOnly ? `${props.label} *` : props.label))

// Добавляем правило — чтобы q-form валидация тоже находила пустое
// (для будущего onSubmit). Сейчас ошибка показывается через :error.
const rules = computed(() =>
  props.required && !props.readOnly
    ? [(v: string) => (!!v && v.trim() !== '') || 'Обязательное поле']
    : [],
)
</script>
