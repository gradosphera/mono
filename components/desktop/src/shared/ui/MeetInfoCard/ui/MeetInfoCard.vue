<template lang="pug">
div
  div.row.justify-around.q-mt-md
    div.col-xs-12.col-md-5

      div.row.q-mb-sm
        div.col-5.card-label Председатель:
        div.col-7.card-value {{ meet.processing?.meet?.presider }}


      div.row.q-mb-sm
        div.col-5.card-label Секретарь:
        div.col-7.card-value {{ meet.processing?.meet?.secretary }}

      div.row.q-mb-sm
        div.col-5.card-label Открытие:
        div.col-7.card-value {{ meetStatus.formattedOpenDate }}


    div.col-xs-12.col-md-5
      div.row.q-mb-sm
        div.col-5.card-label Кворум:
        div.col-7.card-value {{ meet.processing?.meet?.quorum_percent }}%


      div.row.q-mb-sm
        div.col-5.card-label Кворум достигнут:
        div.col-7.card-value
          q-badge(
            :color="meet.processing?.meet?.quorum_passed ? 'positive' : 'red'"
            :label="meet.processing?.meet?.quorum_passed ? 'Да' : 'Нет'"
            outline
          )
      div.row.q-mb-sm
        div.col-5.card-label Закрытие:
        div.col-7.card-value {{ meetStatus.formattedCloseDate }}

  div.row.q-mb-sm.q-mt-md
    div.col-12

      q-linear-progress(
        :value="(meet.processing?.meet?.current_quorum_percent ?? 0) / 100"
        :buffer="(meet.processing?.meet?.quorum_percent ?? 0) / 100"
        track-color="lime"
        size="40px"
        rounded
      ).bg-grey
        div.absolute-full.flex.flex-center.q-gutter-sm
          q-badge(
            style="font-size: 16px;"
            color="white"
            text-color="black"
          )
            | Явка: {{ meet.processing?.meet?.current_quorum_percent ?? 0 }}%
            //-  | Кворум: {{ meet.processing?.meet?.quorum_percent ?? 0 }}%

      MeetStatusBanner(:meet="meet")

</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'
import { useMeetStatus } from 'src/shared/lib/composables'
import { MeetStatusBanner } from 'src/shared/ui/MeetStatusBanner'
const props = defineProps<{
  meet: IMeet
}>()

const meetStatus = useMeetStatus(props.meet)
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';
</style>
