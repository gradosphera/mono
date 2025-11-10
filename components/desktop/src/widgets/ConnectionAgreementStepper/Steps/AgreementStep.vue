<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader'
import { Loader } from 'src/shared/ui/Loader'

const props = withDefaults(defineProps<IStepProps & {
  html?: string
  onSign?: () => void
  onBack?: () => void
}>(), {})

const emits = defineEmits<{
  back: []
  sign: []
}>()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const handleSign = () => {
  emits('sign')
}

const handleBack = () => {
  emits('back')
}
</script>

<template lang="pug">
q-step(
  :name="2"
  title="Соглашение о подключении"
  icon="description"
  :done="isDone"
)
  .q-pa-md
    template(v-if="html")
      DocumentHtmlReader(:html="html")
    template(v-else)
      Loader(:text='`Готовим соглашение...`')

  q-stepper-navigation.q-gutter-sm(v-if="html")
    q-btn(
      v-if="isActive"
      color="grey-6"
      flat
      label="Назад"
      @click="handleBack"
    )
    q-btn(
      v-if="isActive"
      color="primary"
      label="Подписать"
      @click="handleSign"
    )
</template>
