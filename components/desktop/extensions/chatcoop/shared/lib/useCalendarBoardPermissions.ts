import { computed, type ComputedRef } from 'vue'
import { useSessionStore } from 'src/entities/Session'

/** Создание / редактирование / удаление событий календаря — только председатель и член совета (с бэкендом согласовано). */
export function useCalendarBoardPermissions(): {
  canManageCalendarEvents: ComputedRef<boolean>
} {
  const session = useSessionStore()
  const canManageCalendarEvents = computed(() => session.isChairman || session.isMember)
  return { canManageCalendarEvents }
}
