<template lang="pug">
div.q-pa-md
  router-view(v-if="$route.name !== 'user-meets' && $route.name !== 'meets'")
  template(v-else)
    div.row.justify-center
      div.col-12
        div.row.q-mb-md(v-if="canCreateMeet")
          CreateMeet(@create="handleCreate")

        MeetsTable(
          :meets="meets"
          :loading="loading"
          @vote="handleVote"
          @close="handleCloseMeet"
          @restart="showRestartMeetDialog"
          @view="navigateToMeetDetails"
        )
    
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MeetsTable } from 'src/widgets/Meets/MeetsTable'
import { CreateMeet } from 'src/features/Meet/CreateMeet'
import { useMeetManagement } from '../model'
import type { IMeet } from 'src/entities/Meet'
import { useCurrentUserStore } from 'src/entities/User'

const route = useRoute()
const router = useRouter()
const coopname = computed(() => route.params.coopname as string)

const {isChairman, isMember} = useCurrentUserStore()

const {
  meets,
  loading,
  loadMeets,
  handleCreateMeet,
  handleCloseMeet,
  handleVote
} = useMeetManagement(coopname.value)

// Диалоги
const currentMeetToRestart = ref<IMeet | null>(null)

// Обработчики
const handleCreate = async (formData: any) => {
  const success = await handleCreateMeet(formData)
  return success
}

const showRestartMeetDialog = (meet: IMeet) => {
  currentMeetToRestart.value = meet
}

// Навигация на детальную страницу собрания
const navigateToMeetDetails = (meet: IMeet) => {
  router.push({
    name: route.name === 'meets' ? 'meet-details' : 'user-meet-details',
    params: {
      coopname: coopname.value,
      hash: meet.hash
    }
  })
}

// Проверка разрешений
const canCreateMeet = computed(() => {
  return isMember || isChairman
})

// Загрузка данных при монтировании компонента
onMounted(() => {
  if (route.name === 'user-meets' || route.name === 'meets') {
    loadMeets()
  }
})

// Следим за изменениями маршрута
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName === 'user-meets' || newRouteName === 'meets') {
      loadMeets()
    }
  }
)
</script>
