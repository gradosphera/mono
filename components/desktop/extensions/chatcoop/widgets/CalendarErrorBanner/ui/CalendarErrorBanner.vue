<template lang="pug">
q-banner(v-if="calendarStore.error", class="bg-negative text-white q-mb-md", dense)
  template(#avatar)
    q-icon(name="fa-solid fa-triangle-exclamation")
  | {{ calendarStore.error }}
  template(#action)
    q-btn(flat, color="white", @click="calendarStore.clearError") OK
</template>

<script lang="ts" setup>
import { useChatCoopCalendarStore } from '../../../entities/ChatCoopCalendar/model/store'

const calendarStore = useChatCoopCalendarStore()
</script>
