<template lang="pug">
.participant-actions
  // Отображаем статус для всех пользователей
  p.text-caption {{ statusLabel }}

  // GENERATION - кнопка обновления сегмента (доступна всем пользователям)
  template(v-if='segment.status === Zeus.SegmentStatus.GENERATION')
    RefreshSegmentButton(
      :segment='segment',
      @click.stop
    )

  // READY - кнопка расчета голосов (доступна всем пользователям)
  template(v-if='segment.status === Zeus.SegmentStatus.READY && segment.has_vote && segment.is_votes_calculated === false')
    CalculateVotesButton(
      :coopname='coopname',
      :project-hash='segment.project_hash',
      :username='segment.username'
    )

  // Действия для владельца сегмента
  template(v-if='segment.username === currentUsername')

    // READY - если голоса рассчитаны (при их наличии) - показываем следующее действие
    template(v-if='segment.status === Zeus.SegmentStatus.READY && (!segment.has_vote || segment.is_votes_calculated === true)')
      // Все участники видят кнопку внесения результата
      PushResultButton(
        :segment='segment'
        @click.stop
      )

    // AUTHORIZED - кнопка подписания акта участником
    template(v-if='segment.status === Zeus.SegmentStatus.AUTHORIZED')
      SignActButton(
        :segment='segment'
        :coopname='coopname'
        @click.stop
      )

    // CONTRIBUTED - кнопка конвертации сегмента
    template(v-if='segment.status === Zeus.SegmentStatus.CONTRIBUTED && !segment.is_completed')
      ConvertSegmentButton(
        @click.stop='showConvertDialog = true'
      )

  // Действия для председателя
  template(v-if='isChairman')
    // ACT1 - кнопка подписания акта председателем
    template(v-if='segment.status === Zeus.SegmentStatus.ACT1')
      SignActButtonByChairman(
        :segment='segment'
        :coopname='coopname'
        @click.stop
      )


  // Диалог конвертации сегмента
  ConvertSegmentDialog(
    v-model='showConvertDialog',
    :segment='segment'
  )
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PushResultButton } from 'app/extensions/capital/features/Result/PushResult/ui';
import { RefreshSegmentButton } from 'app/extensions/capital/features/Project/RefreshSegment/ui';
import { SignActButton, SignActButtonByChairman } from 'app/extensions/capital/features/Result/SignAct/ui';
import { ConvertSegmentButton, ConvertSegmentDialog } from 'app/extensions/capital/features/Project/ConvertSegment/ui';
import { CalculateVotesButton } from 'app/extensions/capital/features/Vote/CalculateVotes/ui';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session/model';
import { Zeus } from '@coopenomics/sdk';
import { getSegmentStatusLabel } from 'app/extensions/capital/shared/lib/segmentStatus';

interface Props {
  segment: ISegment;
}


const props = defineProps<Props>();

const { info } = useSystemStore();
const { username, isChairman } = useSessionStore();

// Состояние диалога конвертации
const showConvertDialog = ref(false);

// Получаем coopname из system store
const coopname = computed(() => info.coopname);

// Текущий пользователь
const currentUsername = computed(() => username);

// Текст статуса сегмента
const statusLabel = computed(() => getSegmentStatusLabel(props.segment.status, props.segment.is_completed, props.segment));

</script>

<style lang="scss" scoped>
.participant-actions {
  margin-top: 8px;
}
</style>
