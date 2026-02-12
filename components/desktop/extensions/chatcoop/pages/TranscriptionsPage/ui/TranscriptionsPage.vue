<template lang="pug">
div.transcriptions-page
  // Заголовок страницы
  q-card.q-mb-md
    q-card-section
      .row.items-center.justify-between
        .text-h6
          q-icon(name="fa-solid fa-file-lines" class="q-mr-sm")
          | Транскрипции звонков
        q-btn(
          flat
          round
          icon="fa-solid fa-refresh"
          @click="handleRefresh"
          :loading="transcriptionStore.isLoading"
        )
          q-tooltip Обновить

  // Состояние загрузки
  WindowLoader(v-if="transcriptionStore.isLoading && transcriptionStore.transcriptions.length === 0" text="Загрузка транскрипций...")

  // Сообщение об ошибке
  q-card(v-else-if="transcriptionStore.error")
    q-card-section
      .text-negative {{ transcriptionStore.error }}
      q-btn.q-mt-sm(color="primary" @click="handleRefresh") Повторить попытку

  // Пустой список
  q-card(v-else-if="transcriptionStore.transcriptions.length === 0")
    q-card-section.text-center
      q-icon(name="fa-solid fa-file-lines" size="48px" color="grey-6")
      .text-body1.q-mt-md Транскрипции не найдены
      .text-caption.text-grey-6.q-mt-sm Транскрипции звонков будут появляться здесь автоматически

  // Список транскрипций
  q-list(v-else separator)
    q-item(
      v-for="transcription in transcriptionStore.transcriptions"
      :key="transcription.id"
      clickable
      v-ripple
      @click="goToDetail(transcription.id)"
    )
      q-item-section(avatar)
        q-avatar(
          :color="getStatusColor(transcription.status)"
          text-color="white"
          size="40px"
        )
          q-icon(:name="getStatusIcon(transcription.status)")
      q-item-section
        q-item-label {{ transcription.roomName || 'Звонок' }}
        q-item-label(caption)
          | {{ formatDateTime(transcription.startedAt) }}
          span.q-ml-sm(v-if="transcription.endedAt")
            | — {{ formatDuration(transcription.startedAt, transcription.endedAt) }}

      q-item-section(side top)
        q-badge(
          :color="getStatusColor(transcription.status)"
          :label="getStatusLabel(transcription.status)"
        )
        .text-caption.text-grey-6.q-mt-xs
          | {{ transcription.participants?.length || 0 }} участников

  // Пагинация
  .row.justify-center.q-mt-md(v-if="hasMore")
    q-btn(
      flat
      label="Загрузить ещё"
      @click="loadMore"
      :loading="transcriptionStore.isLoading"
    )
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { WindowLoader } from 'src/shared/ui/Loader';
import {
  formatDateTime,
  formatDuration,
  getStatusColor,
  getStatusIcon,
  getStatusLabel
} from '../../../shared/lib/transcriptionUtils';
import { useTranscriptionStore } from '../../../entities/Transcription/model';

const router = useRouter();
const transcriptionStore = useTranscriptionStore();

const pageSize = 20;
let currentOffset = 0;

const hasMore = computed(() => {
  return transcriptionStore.transcriptions.length >= currentOffset + pageSize;
});


function goToDetail(id: string): void {
  router.push({
    name: 'chatcoop-transcription-detail',
    params: { id },
  });
}

async function handleRefresh(): Promise<void> {
  currentOffset = 0;
  await transcriptionStore.loadTranscriptions(pageSize, 0);
}

async function loadMore(): Promise<void> {
  currentOffset += pageSize;
  await transcriptionStore.loadTranscriptions(pageSize, currentOffset);
}

onMounted(async () => {
  await transcriptionStore.loadTranscriptions(pageSize, 0);
});
</script>

<style scoped>
.transcriptions-page {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
