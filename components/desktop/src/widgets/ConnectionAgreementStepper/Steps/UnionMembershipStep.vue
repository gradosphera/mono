<script setup lang="ts">
import { computed } from 'vue'
import type { IStepProps } from '../model/types'

import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'
import { useSystemStore } from 'src/entities/System/model';

const props = withDefaults(defineProps<IStepProps>(), {})

const system = useSystemStore()
const connectionAgreement = useConnectionAgreementStore()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const unionLink = computed(() => system.info.union_link)

const handleContinue = () => {
  if (connectionAgreement.currentStep === 0) {
    connectionAgreement.setCurrentStep(1)
  }
}

const openUnionLink = () => {
  if (unionLink.value) {
    window.open(unionLink.value, '_blank')
  }
}
</script>

<template lang="pug">
q-step(
  :name="0"
  title="Членство в союзе"
  icon="group"
  :done="isDone"
)
  .q-pa-md
    .text-h6.q-mb-md Для подключения к Кооперативной Экономике кооператив должен быть членом союза

    .q-mb-md
      | Для вступления в союз перейдите по ссылке:
      br
      q-btn(
        v-if="unionLink"
        flat
        color="primary"
        :label="unionLink"
        @click="openUnionLink"
        no-caps
        class="q-mt-sm"
      )
      span(v-else).text-grey-6 Ссылка недоступна

    .q-mb-lg После вступления в союз, пожалуйста, продолжайте процесс подключения.

  q-stepper-navigation.q-gutter-sm
    q-btn(
      v-if="isActive"
      color="primary"
      label="Продолжить"
      @click="handleContinue"
    )
</template>
