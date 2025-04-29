<template lang="pug">
div
  q-btn(
    color="primary"
    label="Создать общее собрание"
    @click="showCreateMeetDialog = true"
  )
  CreateMeetForm(
    v-model="showCreateMeetDialog"
    :loading="isCreating"
    @create="handleCreate"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CreateMeetForm } from './index'

const showCreateMeetDialog = ref(false)
const isCreating = ref(false)

const emit = defineEmits<{
  (e: 'create', formData: any): void
}>()

const handleCreate = async (formData: any) => {
  isCreating.value = true
  try {
    emit('create', formData)
  } finally {
    isCreating.value = false
  }
}
</script> 