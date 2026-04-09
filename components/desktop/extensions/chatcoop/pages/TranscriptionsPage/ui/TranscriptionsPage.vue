<template lang="pug">
div.transcriptions-page
  header.page-head
    div.page-head__text
      h1.page-head__title Транскрипции звонков
      p.page-head__subtitle Записи распознанной речи из кооперативных звонков
    q-btn.page-head__action(
      flat
      round
      dense
      icon="fa-solid fa-rotate-right"
      @click="handleRefresh"
      :loading="transcriptionStore.isLoading"
      aria-label="Обновить список"
    )
      q-tooltip Обновить

  WindowLoader(v-if="transcriptionStore.isLoading && transcriptionStore.transcriptions.length === 0" text="Загрузка транскрипций...")

  div.tr-panel(v-else-if="transcriptionStore.error")
    p.tr-panel__error {{ transcriptionStore.error }}
    q-btn(flat dense no-caps color="primary" @click="handleRefresh") Повторить

  div.tr-empty(v-else-if="transcriptionStore.transcriptions.length === 0")
    q-icon.tr-empty__icon(name="fa-solid fa-file-lines" size="40px")
    p.tr-empty__title Нет транскрипций
    p.tr-empty__hint Они появятся здесь после звонков с включённым секретарём


  div.tr-list(v-else)
    button.tr-list__row(
      v-for="transcription in transcriptionStore.transcriptions"
      :key="transcription.id"
      type="button"
      @click="goToDetail(transcription.id)"
    )
      div.tr-list__main
        span.tr-list__name {{ transcription.roomName || 'Звонок' }}
        span.tr-list__meta
          | {{ formatDateTime(transcription.startedAt) }}
          template(v-if="transcription.endedAt")
            span.tr-list__meta-sep —
            | {{ formatDuration(transcription.startedAt, transcription.endedAt) }}
        p.tr-list__memo(v-if="transcription.memo") {{ transcription.memo }}
      div.tr-list__side
        q-badge.tr-badge(
          :color="getStatusColor(transcription.status)"
          :label="getStatusLabel(transcription.status)"
          outline
        )
        span.tr-list__count {{ formatParticipantsCount(transcription.participants?.length ?? 0) }}

  div.tr-loadmore(v-if="hasMore")
    q-btn(flat dense no-caps color="grey-7" @click="loadMore" :loading="transcriptionStore.isLoading") Загрузить ещё
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { WindowLoader } from 'src/shared/ui/Loader';
import {
  formatDateTime,
  formatDuration,
  formatParticipantsCount,
  getStatusColor,
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
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 20px 32px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--tr-border);
}

.page-head__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--tr-text);
}

.page-head__subtitle {
  margin: 6px 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--tr-muted);
  max-width: 36rem;
}

.page-head__action {
  color: var(--tr-muted);
  flex-shrink: 0;
}

.tr-panel,
.tr-empty {
  border: 1px solid var(--tr-border);
  border-radius: 10px;
  padding: 24px 20px;
  text-align: center;
}

.tr-panel__error {
  margin: 0 0 12px;
  color: var(--q-negative, #c10015);
  font-size: 0.9rem;
}

.tr-empty__icon {
  color: var(--tr-muted);
  opacity: 0.55;
}

.tr-empty__title {
  margin: 14px 0 6px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--tr-text);
}

.tr-empty__hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--tr-muted);
  line-height: 1.45;
}

.tr-list {
  border: 1px solid var(--tr-border);
  border-radius: 10px;
  overflow: hidden;
}

.tr-list__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 14px 18px;
  margin: 0;
  border: none;
  border-bottom: 1px solid var(--tr-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
  color: inherit;
  font: inherit;
}

.tr-list__row:last-child {
  border-bottom: none;
}

.tr-list__row:hover {
  background: var(--tr-hover);
}

.tr-list__row:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: -2px;
}

.tr-list__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.tr-list__name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--tr-text);
  line-height: 1.35;
}

.tr-list__meta {
  font-size: 0.8125rem;
  color: var(--tr-muted);
  line-height: 1.4;
}

.tr-list__meta-sep {
  margin: 0 0.25em;
  opacity: 0.65;
}

.tr-list__memo {
  margin: 6px 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--tr-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  text-align: left;
}

.tr-list__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.tr-list__count {
  font-size: 0.8125rem;
  color: var(--tr-muted);
  line-height: 1.3;
  text-align: right;
}

.tr-badge {
  font-weight: 500;
  font-size: 0.7rem;
}

.tr-loadmore {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.transcriptions-page {
  --tr-text: rgba(0, 0, 0, 0.87);
  --tr-muted: rgba(0, 0, 0, 0.52);
  --tr-border: rgba(0, 0, 0, 0.08);
  --tr-hover: rgba(0, 0, 0, 0.03);
}

.body--dark .transcriptions-page {
  --tr-text: rgba(255, 255, 255, 0.9);
  --tr-muted: rgba(255, 255, 255, 0.45);
  --tr-border: rgba(255, 255, 255, 0.1);
  --tr-hover: rgba(255, 255, 255, 0.04);
}
</style>
