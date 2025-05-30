<template lang="pug">
div
  div.row.q-mb-sm
    div.col-12
      div.text-h5.q-mb-xs.full-width.text-center Общее собрание № {{ meet.processing?.meet?.id }}


  div.row.justify-around.q-mt-md
    div.col-xs-12.col-md-5

      div.row.q-mb-sm
        div.col-5.card-label Председатель:
        div.col-7.card-value {{ getNameFromCertificate(meet.processing?.meet?.presider_certificate) }}

      div.row.q-mb-sm
        div.col-5.card-label Секретарь:
        div.col-7.card-value {{ getNameFromCertificate(meet.processing?.meet?.secretary_certificate) }}

      div.row.q-mb-sm
        div.col-5.card-label Открытие:
        div.col-7.card-value {{ meetStatus.formattedOpenDate }}

    div.col-xs-12.col-md-5
      div.row.q-mb-sm
        div.col-5.card-label Кворум:
        div.col-7.card-value {{ meet.processing?.meet?.quorum_percent }}%

      div.row.q-mb-sm
        div.col-5.card-label Явка:
        div.col-7.card-value {{ meet.processing?.meet?.current_quorum_percent }}%


      div.row.q-mb-sm
        div.col-5.card-label Закрытие:
        div.col-7.card-value {{ meetStatus.formattedCloseDate }}

  div.row.justify-around
    MeetStatusBanner(:meet="meet")

</template>

<script setup lang="ts">
import type { IMeet } from 'src/entities/Meet'
import { useMeetStatus } from 'src/shared/lib/composables'
import { getNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate'
import { MeetStatusBanner } from 'src/shared/ui/MeetStatusBanner'

const props = defineProps<{
  meet: IMeet
}>()

const meetStatus = useMeetStatus(props.meet)
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';
</style>
