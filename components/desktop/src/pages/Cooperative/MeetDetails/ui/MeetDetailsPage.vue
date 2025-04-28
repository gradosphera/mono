<template lang="pug">
div.q-pa-md
  div(v-if="loading")
    q-skeleton(type="rect" height="200px" class="q-mb-md")
    q-skeleton(type="rect" height="100px" v-for="i in 3" :key="i" class="q-mb-md")

  div(v-else-if="!meet")
    div.text-h5.text-center Собрание не найдено

  div(v-else)
    MeetDetailsHeader(:meet="meet")
    
    MeetDetailsActions(
      :meet="meet"
      :coopname="coopname"
      :meet-hash="meetHash"
      class="q-mt-md"
    )
    
    MeetDetailsAgenda(
      :meet="meet"
      class="q-mt-md"
    )
    
    MeetDetailsVoting(
      :meet="meet"
      :coopname="coopname"
      :meet-hash="meetHash"
      class="q-mt-md"
    )
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { MeetDetailsHeader } from 'src/widgets/Meets/MeetDetailsHeader'
import { MeetDetailsActions } from 'src/widgets/Meets/MeetDetailsActions'
import { MeetDetailsAgenda } from 'src/widgets/Meets/MeetDetailsAgenda'
import { MeetDetailsVoting } from 'src/widgets/Meets/MeetDetailsVoting'
import { useMeetStore } from 'src/entities/Meet'
import { FailAlert } from 'src/shared/api'
import type { IMeet } from 'src/entities/Meet'
import { useDesktopStore } from 'src/entities/Desktop/model'
import { useBackButton } from 'src/shared/lib/navigation'

const route = useRoute()
const meetStore = useMeetStore()
const desktopStore = useDesktopStore()

const coopname = computed(() => route.params.coopname as string)
const meetHash = computed(() => route.params.hash as string)

const meet = ref<IMeet | null>(null)
const loading = ref(true)

const loadMeetDetails = async () => {
  loading.value = true
  try {
    const result = await meetStore.loadMeet({
      coopname: coopname.value,
      hash: meetHash.value
    })
    meet.value = result
  } catch (error: any) {
    FailAlert(error)
  } finally {
    loading.value = false
  }
}

// Настройка кнопки навигации
const workspace = computed(() => desktopStore.activeWorkspaceName)
const buttonText = computed(() => workspace.value === 'soviet' ? 'Собрания' : 'Мои Собрания')
const targetRouteName = computed(() => workspace.value === 'soviet' ? 'meets' : 'user-meets')

// Используем хук для управления кнопкой
useBackButton({
  text: buttonText.value,
  routeName: targetRouteName.value,
  params: { coopname: coopname.value },
  componentId: 'meet-details-' + meetHash.value
})

// Загрузка деталей собрания
onMounted(() => {
  loadMeetDetails()
})
</script>
