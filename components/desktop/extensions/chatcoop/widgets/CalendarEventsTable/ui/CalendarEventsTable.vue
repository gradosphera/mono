<template lang="pug">
q-table(
  flat,
  bordered,
  :rows="calendarStore.events",
  :columns="columns",
  row-key="id",
  :loading="calendarStore.isLoading",
  no-data-label="Нет событий"
)
  template(#body-cell-room="props")
    q-td(:props="props") {{ roomLabel(props.row.matrixRoomId) }}
  template(#body-cell-starts="props")
    q-td(:props="props") {{ formatCalendarDateTime(props.row.startsAt) }}
  template(#body-cell-ends="props")
    q-td(:props="props") {{ props.row.endsAt ? formatCalendarDateTime(props.row.endsAt) : '—' }}
  template(#body-cell-actions="props")
    q-td(:props="props")
      q-btn(
        flat,
        dense,
        round,
        icon="fa-solid fa-comments",
        @click="goChat(props.row.matrixRoomId)"
      )
        q-tooltip Открыть комнату в мессенджере
      q-btn(
        v-if="canManageCalendarEvents",
        flat,
        dense,
        round,
        icon="fa-solid fa-pen",
        @click="onEdit(props.row)"
      )
      q-btn(
        v-if="canManageCalendarEvents",
        flat,
        dense,
        round,
        color="negative",
        icon="fa-solid fa-trash",
        @click="onDelete(props.row)"
      )
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useChatCoopCalendarStore } from '../../../entities/ChatCoopCalendar/model/store'
import type { IChatCoopCalendarEvent } from '../../../entities/ChatCoopCalendar/model/types'
import { formatCalendarDateTime } from '../../../shared/lib/calendarDateFormat'
import { useCalendarBoardPermissions } from '../../../shared/lib/useCalendarBoardPermissions'

defineProps<{
  onEdit: (row: IChatCoopCalendarEvent) => void
  onDelete: (row: IChatCoopCalendarEvent) => void
}>()

const calendarStore = useChatCoopCalendarStore()
const router = useRouter()
const { canManageCalendarEvents } = useCalendarBoardPermissions()

const columns = [
  { name: 'title', label: 'Событие', field: 'title', align: 'left' as const },
  { name: 'room', label: 'Комната', field: 'matrixRoomId', align: 'left' as const },
  { name: 'starts', label: 'Начало', field: 'startsAt', align: 'left' as const },
  { name: 'ends', label: 'Окончание', field: 'endsAt', align: 'left' as const },
  { name: 'actions', label: '', field: 'id', align: 'right' as const },
]

function roomLabel(matrixRoomId: string): string {
  return calendarStore.rooms.find((r) => r.matrixRoomId === matrixRoomId)?.displayLabel ?? matrixRoomId
}

function goChat(matrixRoomId: string): void {
  void router.push({ name: 'chatcoop-chat', query: { matrix_room: matrixRoomId } })
}
</script>
