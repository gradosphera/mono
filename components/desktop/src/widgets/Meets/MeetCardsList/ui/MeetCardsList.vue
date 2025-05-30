<template lang="pug">
div.scroll-area(style="height: calc(100% - $toolbar-min-height); overflow-y: auto;")
  // Заголовок с текстом в зависимости от наличия собраний
  div.q-pa-md.q-pb-xs(v-if="!loading && meets.length === 0")
    p.q-my-none.text-center.text-grey-6 У кооператива нет предстоящих общих собраний

  div(v-if="loading" class="q-pa-md")
    div(v-for="i in 3" :key="i" class="q-mb-lg")
      q-skeleton(type="rect" height="300px" class="rounded")

  div(v-else-if="!meets.length" class="text-center q-pa-xl")
    q-icon(name="event_busy" size="64px" color="grey-6")

  div(v-else class="q-pa-md")
    div.row.q-col-gutter-md
      div.col-12(v-for="meet in meets" :key="meet.hash")
        q-card(flat bordered @click="navigateToMeetDetails(meet)").info-card.hover-card.cursor-pointer
          MeetDetailsInfo(:meet="meet").hover

</template>

<script setup lang="ts">
import { MeetDetailsInfo } from 'src/widgets/Meets/MeetDetailsInfo'
import type { IMeet } from 'src/entities/Meet'
import { useRouter } from 'vue-router'
import { useDesktopStore } from 'src/entities/Desktop/model'

defineProps<{
  meets: IMeet[]
  loading: boolean
}>()

const router = useRouter()
const desktop = useDesktopStore()

// Навигация к деталям собрания (скопировано из MeetsTable)
const navigateToMeetDetails = (meet: IMeet) => {
  const currentWorkspace = desktop.activeWorkspaceName
  const isSoviet = currentWorkspace === 'soviet'

  const routeName = isSoviet ? 'meet-details' : 'user-meet-details'

  router.push({
    name: routeName,
    params: {
      hash: meet.hash,
      coopname: router.currentRoute.value.params.coopname
    }
  })
}
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';
</style>
