<template lang="pug">
.participant-actions
  // Отображаем статус для всех пользователей
  p.text-caption {{ statusLabel }}

  // Действия для владельца сегмента
  template(v-if='segment.username === currentUsername')
    // GENERATION - кнопка обновления сегмента
    template(v-if='segment.status === Zeus.SegmentStatus.GENERATION')
      RefreshSegmentButton(
        :segment='segment',
        @click.stop
      )

    // READY - кнопка внесения результата
    template(v-else-if='segment.status === Zeus.SegmentStatus.READY')
      PushResultButton(
        :segment='segment'
        @click.stop
      )

    // AUTHORIZED - кнопка подписания акта участником
    template(v-else-if='segment.status === Zeus.SegmentStatus.AUTHORIZED')
      SignActButton(
        :segment='segment'
        :coopname='coopname'
        @click.stop
      )

  // Действия для председателя
  template(v-else-if='isChairman')
    // ACT1 - кнопка подписания акта председателем
    template(v-if='segment.status === Zeus.SegmentStatus.ACT1')
      SignActButtonByChairman(
        :segment='segment'
        :coopname='coopname'
        @click.stop
      )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PushResultButton } from 'app/extensions/capital/features/Result/PushResult/ui';
import { RefreshSegmentButton } from 'app/extensions/capital/features/Project/RefreshSegment/ui';
import { SignActButton, SignActButtonByChairman } from 'app/extensions/capital/features/Result/SignAct/ui';
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

// Получаем coopname из system store
const coopname = computed(() => info.coopname);

// Текущий пользователь
const currentUsername = computed(() => username);

// Текст статуса сегмента
const statusLabel = computed(() => getSegmentStatusLabel(props.segment.status));
</script>

<style lang="scss" scoped>
.participant-actions {
  margin-top: 8px;
}
</style>
