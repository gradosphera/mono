<template lang="pug">
div
  router-view(v-if="$route.name !== 'user-meets' && $route.name !== 'meets'")
  template(v-else)
    div.row.justify-center
      div.col-12
        div.row.q-pa-md(v-if="canCreateMeet")
          CreateMeet
        MeetCardsList(
          :meets="meets"
          :loading="loading"
        )

</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MeetCardsList } from 'src/widgets/Meets/MeetCardsList'
import { CreateMeet } from 'src/features/Meet/CreateMeet'
import { useMeetStore } from 'src/entities/Meet'
import { useCurrentUserStore } from 'src/entities/User'
import { FailAlert } from 'src/shared/api'

const route = useRoute()
const coopname = computed(() => route.params.coopname as string)
const meetStore = useMeetStore()

const {isChairman, isMember} = useCurrentUserStore()

// Данные напрямую из стора
const meets = computed(() => meetStore.meets)
const loading = computed(() => meetStore.loading)

// Загрузка списка собраний
const loadMeets = async () => {
  try {
    await meetStore.loadMeets({ coopname: coopname.value })
  } catch (e: any) {
    FailAlert(e)
  }
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
