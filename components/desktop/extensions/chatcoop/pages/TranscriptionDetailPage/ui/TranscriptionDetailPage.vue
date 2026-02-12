<template lang="pug">
div.transcription-detail-page
  // Кнопка назад
  q-btn.q-mb-md(
    flat
    icon="fa-solid fa-arrow-left"
    label="Назад к списку"
    @click="goBack"
  )

  // Состояние загрузки
  WindowLoader(v-if="transcriptionStore.isLoadingDetail" text="Загрузка транскрипции...")

  // Сообщение об ошибке
  q-card(v-else-if="transcriptionStore.error")
    q-card-section
      .text-negative {{ transcriptionStore.error }}
      q-btn.q-mt-sm(color="primary" @click="loadData") Повторить попытку

  // Транскрипция не найдена
  q-card(v-else-if="!transcription")
    q-card-section.text-center
      q-icon(name="fa-solid fa-file-lines" size="48px" color="grey-6")
      .text-body1.q-mt-md Транскрипция не найдена

  // Детали транскрипции
  template(v-else)
    // Информация о звонке
    q-card.q-mb-md
      q-card-section
        .row.items-center.justify-between
          .text-h6
            q-icon(name="fa-solid fa-phone" class="q-mr-sm")
            | {{ transcription.transcription.roomName || 'Звонок' }}
          q-badge(
            :color="getStatusColor(transcription.transcription.status)"
            :label="getStatusLabel(transcription.transcription.status)"
          )

      q-card-section.q-pt-none
        .row.q-gutter-lg
          .col-auto
            .text-caption.text-grey-6 Начало
            .text-body2 {{ formatDateTime(transcription.transcription.startedAt) }}
          .col-auto(v-if="transcription.transcription.endedAt")
            .text-caption.text-grey-6 Окончание
            .text-body2 {{ formatDateTime(transcription.transcription.endedAt) }}
          .col-auto(v-if="transcription.transcription.endedAt")
            .text-caption.text-grey-6 Длительность
            .text-body2 {{ formatDuration(transcription.transcription.startedAt, transcription.transcription.endedAt) }}
          .col-auto
            .text-caption.text-grey-6 Участников
            .text-body2 {{ transcription.transcription.participants?.length || 0 }}

    // Участники
    q-card.q-mb-md(v-if="transcription.transcription.participants?.length")
      q-card-section
        .text-subtitle2 Участники звонка
        .row.q-gutter-sm.q-mt-sm
          q-chip(
            v-for="participant in transcription.transcription.participants"
            :key="participant"
            color="primary"
            text-color="white"
            size="sm"
          ) {{ participant }}

    // Сегменты транскрипции
    q-card
      q-card-section
        .text-subtitle2 Транскрипция

      q-separator

      // Пустая транскрипция
      q-card-section.text-center(v-if="!transcription.segments?.length")
        q-icon(name="fa-solid fa-file-lines" size="32px" color="grey-6")
        .text-body2.q-mt-sm.text-grey-6 Текст транскрипции отсутствует

      // Список сегментов
      q-list(v-else separator)
        q-item(
          v-for="segment in sortedSegments"
          :key="segment.id"
          class="segment-item"
        )
          q-item-section(avatar top)
            q-avatar(color="primary" text-color="white" size="36px")
              | {{ getSpeakerInitials(segment.speakerName || segment.speakerIdentity) }}
          q-item-section
            q-item-label.overline.text-grey-6
              | {{ segment.speakerName || segment.speakerIdentity }}
              span.q-ml-sm ({{ formatOffset(segment.startOffset) }} - {{ formatOffset(segment.endOffset) }})
            q-item-label {{ segment.text }}
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { WindowLoader } from 'src/shared/ui/Loader';
import {
  formatDateTime,
  formatDuration,
  formatOffset,
  getSpeakerInitials,
  getStatusColor,
  getStatusLabel
} from '../../../shared/lib/transcriptionUtils';
import { useTranscriptionStore } from '../../../entities/Transcription/model';

const router = useRouter();
const route = useRoute();
const transcriptionStore = useTranscriptionStore();

const transcription = computed(() => transcriptionStore.currentTranscription);

const sortedSegments = computed(() => {
  if (!transcription.value?.segments) return [];
  return [...transcription.value.segments].sort((a, b) => a.startOffset - b.startOffset);
});


function goBack(): void {
  router.push({ name: 'chatcoop-transcriptions' });
}

async function loadData(): Promise<void> {
  const id = route.params.id as string;
  if (id) {
    await transcriptionStore.loadTranscription(id);
  }
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.transcription-detail-page {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.segment-item {
  padding: 12px 16px;
}
</style>
