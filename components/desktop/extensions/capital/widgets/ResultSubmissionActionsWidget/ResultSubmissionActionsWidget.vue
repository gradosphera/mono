<template lang="pug">
.participant-actions
  p {{ segment.status }}
  // Для своих сегментов
  template(v-if='segment.username === currentUsername')
    // Сегмент в статусе GENERATION - показываем кнопку обновления
    template(v-if='segment.status === Zeus.SegmentStatus.GENERATION')
      RefreshSegmentButton(
        :segment='segment',
        @click.stop
      )

    // Сегмент в статусе READY
    template(v-if='segment.status === Zeus.SegmentStatus.READY')
      // Если result отсутствует - кнопка PushResult
      template(v-if='!segment.result')
        PushResultButton(
          :segment='segment'
          @click.stop
        )

      // Если result есть
      template(v-else)
        // ResultStatus.CREATED - ожидание предварительного решения
        template(v-if='segment.result.status === Zeus.ResultStatus.CREATED')
          p.text-caption Ожидайте предварительного решения о приёме

        // ResultStatus.APPROVED - ожидание решения совета
        template(v-else-if='segment.result.status === Zeus.ResultStatus.APPROVED')
          p.text-caption Ожидайте решения совета

        // ResultStatus.AUTHORIZED - кнопка подписать акт
        template(v-else-if='segment.result.status === Zeus.ResultStatus.AUTHORIZED')
          SignActButton(
            :segment='segment',
            :coopname='coopname'
            @click.stop
          )

        // ResultStatus.ACT1 - ожидание подписи председателя
        template(v-else-if='segment.result.status === Zeus.ResultStatus.ACT1')
          p.text-caption Ожидаем подпись председателя на акте

    // Сегмент в статусе CONTRIBUTED - результат принят
    template(v-else-if='segment.status === Zeus.SegmentStatus.CONTRIBUTED')
      p.text-caption Результат принят

  // Для чужих сегментов - просто показываем статус
  template(v-else)
    p.text-caption
      template(v-if='segment.status === Zeus.SegmentStatus.READY && segment.result?.status === Zeus.ResultStatus.ACT1') Ожидаем подпись председателя на акте

  // Для председателя - дополнительная кнопка при ACT1 статусе
  template(v-if='isChairman && segment.status === Zeus.SegmentStatus.READY && segment.result?.status === Zeus.ResultStatus.ACT1')
    SignActButtonByChairman(
      :segment='segment',
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

interface Props {
  segment: ISegment;
}

defineProps<Props>();

const { info } = useSystemStore();
const { username, isChairman } = useSessionStore();

// Получаем coopname из system store
const coopname = computed(() => info.coopname);

// Текущий пользователь
const currentUsername = computed(() => username);
</script>

<style lang="scss" scoped>
.participant-actions {
  margin-top: 8px;
}
</style>
