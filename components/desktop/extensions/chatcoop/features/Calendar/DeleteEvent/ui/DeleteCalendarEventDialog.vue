<template lang="pug">
q-dialog(:model-value="modelValue", @update:model-value="onUpdateVisible")
  q-card
    q-card-section Удалить событие «{{ target?.title }}»?
    q-card-actions(align="right")
      q-btn(flat, label="Отмена", @click="close")
      q-btn(color="negative", label="Удалить", :loading="deleting", @click="confirmDelete")
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { api } from '../../../../entities/ChatCoopCalendar/api'
import { useChatCoopCalendarStore } from '../../../../entities/ChatCoopCalendar/model/store'
import type { IChatCoopCalendarEvent } from '../../../../entities/ChatCoopCalendar/model/types'

const props = defineProps<{
  modelValue: boolean
  target: IChatCoopCalendarEvent | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const calendarStore = useChatCoopCalendarStore()
const deleting = ref(false)

function close(): void {
  emit('update:modelValue', false)
}

function onUpdateVisible(open: boolean): void {
  emit('update:modelValue', open)
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) deleting.value = false
  },
)

async function confirmDelete(): Promise<void> {
  if (!props.target) return
  deleting.value = true
  try {
    await api.deleteEvent(props.target.id)
    close()
    await calendarStore.loadAll()
  } catch (e: unknown) {
    console.error(e)
  } finally {
    deleting.value = false
  }
}
</script>
