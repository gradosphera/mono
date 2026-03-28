import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { api } from '../api'
import type { IChatCoopCalendarEvent, IChatCoopCalendarRoomOption } from './types'

const namespace = 'chatCoopCalendarStore'

interface IChatCoopCalendarStore {
  rooms: Ref<IChatCoopCalendarRoomOption[]>
  events: Ref<IChatCoopCalendarEvent[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  loadAll: () => Promise<void>
  clearError: () => void
}

export const useChatCoopCalendarStore = defineStore(
  namespace,
  (): IChatCoopCalendarStore => {
    const rooms = ref<IChatCoopCalendarRoomOption[]>([])
    const events = ref<IChatCoopCalendarEvent[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const loadAll = async (): Promise<void> => {
      isLoading.value = true
      error.value = null
      try {
        const [roomRows, eventRows] = await Promise.all([api.listRooms(), api.listEvents()])
        rooms.value = roomRows
        events.value = eventRows
      } catch (err: unknown) {
        console.error('ChatCoop calendar load failed:', err)
        error.value = 'Не удалось загрузить календарь.'
      } finally {
        isLoading.value = false
      }
    }

    const clearError = (): void => {
      error.value = null
    }

    return {
      rooms,
      events,
      isLoading,
      error,
      loadAll,
      clearError,
    }
  },
)
