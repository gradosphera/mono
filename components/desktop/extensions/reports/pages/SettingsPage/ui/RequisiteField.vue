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
  :maxlength='maxLength'
  :input-mode='inputModeComputed'
  :hint='hint'
  :rules='rules'
  lazy-rules
  dense
  outlined
  @update:model-value='onInput'
  @blur='onBlur'
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
  /** Поле обязательно; пустое значение → «Обязательное поле» (после blur). */
  required?: boolean
  /** Quasar mask для фиксированной длины (напр. `###-###-######`). */
  mask?: string
  /** Подставлять плейсхолдеры маски при вводе */
  fillMask?: boolean
  /** Разрешить только цифры (фильтрует ввод). */
  digitsOnly?: boolean
  /** Разрешить только цифры и точки (для ОКВЭД: 94.99, 46.73.7 и т.п.). */
  digitsDotsOnly?: boolean
  /** Жёсткое ограничение длины поля (HTML maxlength). */
  maxLength?: number
  /** Допустимые точные длины (ИЛИ). Напр. `[8, 11]` для ОКТМО, `[8, 10]` для ОКПО. */
  exactLengths?: number[]
  /** Регекс финального значения; показываем `patternMessage`, если не совпало. */
  pattern?: RegExp
  /** Текст ошибки для `pattern`. */
  patternMessage?: string
  /** Подсказка под полем */
  hint?: string
}>()

const emit = defineEmits<{
  'update:value': [value: string]
  blur: []
}>()

const labelText = computed(() => (props.required && !props.readOnly ? `${props.label} *` : props.label))

const inputModeComputed = computed<'numeric' | 'decimal' | 'text'>(() => {
  if (props.digitsOnly) return 'numeric'
  if (props.digitsDotsOnly) return 'decimal'
  return 'text'
})

const rules = computed(() => {
  const rs: Array<(v: string) => true | string> = []
  if (props.required && !props.readOnly) {
    rs.push((v) => (!!v && String(v).trim() !== '') || 'Обязательное поле')
  }
  if (props.exactLengths && props.exactLengths.length > 0) {
    const expected = props.exactLengths
    rs.push((v) => {
      const s = String(v ?? '')
      // Пустое значение обрабатывает required-правило (или оно не обязательно).
      if (!s) return true
      return expected.includes(s.length) || `Допустимая длина: ${expected.join(' или ')} цифр`
    })
  }
  if (props.pattern) {
    const re = props.pattern
    const msg = props.patternMessage ?? 'Некорректный формат'
    rs.push((v) => {
      const s = String(v ?? '')
      if (!s) return true
      return re.test(s) || msg
    })
  }
  return rs
})

function onInput(raw: string | number | null): void {
  let s = String(raw ?? '')
  if (props.digitsOnly) s = s.replace(/\D+/g, '')
  if (props.digitsDotsOnly) s = s.replace(/[^\d.]+/g, '')
  if (props.maxLength && s.length > props.maxLength) s = s.slice(0, props.maxLength)
  emit('update:value', s)
}

function onBlur(): void {
  emit('blur')
}
</script>
