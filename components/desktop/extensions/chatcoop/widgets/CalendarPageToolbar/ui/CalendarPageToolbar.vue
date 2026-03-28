<template lang="pug">
div
  .row.items-center.q-mb-md
    .text-h6 Календарь событий
    q-space
    q-btn.q-mr-sm(
      color="primary",
      outline,
      :loading="calendarStore.isLoading",
      @click="onRefresh"
    )
      q-icon(name="fa-solid fa-rotate").q-mr-sm
      span Обновить
    q-btn.q-mr-sm(
      color="secondary",
      outline,
      :loading="icsLoading",
      @click="toggleIcsPanel"
    )
      q-icon(name="fa-solid fa-link").q-mr-sm
      span Установить
    q-btn(
      v-if="canManageCalendarEvents",
      color="primary",
      icon="fa-solid fa-plus",
      @click="onRequestCreate"
    ) Новое событие
  q-card(v-if="icsPanelOpen && icsUrl", flat, class="q-mb-md")
    q-card-section
      .text-subtitle2.q-mb-sm Скопируйте ссылку и импортируйте в ваш календарь для синхронизации событий
      CopyableInput(:model-value="icsUrl", label="URL", standout)
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { CopyableInput } from 'src/shared/ui/CopyableInput'
import { api } from '../../../entities/ChatCoopCalendar/api'
import { useChatCoopCalendarStore } from '../../../entities/ChatCoopCalendar/model/store'
import { useCalendarBoardPermissions } from '../../../shared/lib/useCalendarBoardPermissions'

defineProps<{
  onRefresh: () => void
  onRequestCreate: () => void
}>()

const calendarStore = useChatCoopCalendarStore()
const { canManageCalendarEvents } = useCalendarBoardPermissions()
const icsUrl = ref<string | null>(null)
const icsPanelOpen = ref(false)
const icsLoading = ref(false)

async function toggleIcsPanel(): Promise<void> {
  if (icsPanelOpen.value) {
    icsPanelOpen.value = false
    return
  }
  icsLoading.value = true
  try {
    icsUrl.value = await api.createIcsSubscription()
    icsPanelOpen.value = true
  } catch (e: unknown) {
    console.error(e)
  } finally {
    icsLoading.value = false
  }
}
</script>
