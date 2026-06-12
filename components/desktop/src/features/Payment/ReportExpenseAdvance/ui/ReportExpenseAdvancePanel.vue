<template lang="pug">
.report-advance(v-if='item')
  //- Без отдельных кнопок: выбранный файл сразу загружается, по первому чеку
  //- отчёт уходит автоматически; дополнительные файлы дополняют отчёт.
  template(v-if='isReported || isAwaitingReport')
    .t-sm.t-muted(v-if='isReported') Отчёт по авансу подан — дополнительные документы дополнят его автоматически
    .t-sm.t-muted(v-else) Аванс получен — приложите чек: отчёт уйдёт сразу после загрузки
    .files(v-if='files.length')
      button.file-link(
        v-for='file in files',
        :key='file.id',
        type='button',
        :disabled='openingId === file.id',
        @click='openFile(file)'
      )
        q-icon(name='attach_file', size='16px')
        span {{ fileLabel(file) }}
        q-spinner(v-if='openingId === file.id', size='14px')
    FileUploader(
      v-model='pending',
      accept='image/jpeg,image/png,image/webp,image/heic,application/pdf',
      :max-size='20 * 1024 * 1024',
      title='Приложите чек',
      hint='Изображение или PDF до 20 МБ — отправится сразу',
      :disabled='uploading || reporting'
    )
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import { FileUploader } from 'src/shared/ui/domain/FileUploader';
import {
  attachExpenseProofApi,
  type IExpenseFile,
} from 'src/features/Payment/AttachExpenseProof';
import { api, type IExpenseProposalItem } from '../api';

const props = defineProps<{
  proposalHash: string;
  itemHash: string;
}>();

const emit = defineEmits<{
  (e: 'reported'): void;
}>();

const system = useSystemStore();

const item = ref<IExpenseProposalItem | null>(null);
const files = ref<IExpenseFile[]>([]);
const pending = ref<File | null>(null);
const uploading = ref(false);
const reporting = ref(false);

// Панель — только для аванса под отчёт: по счёту (DIRECT) отчётный документ
// прикладывает кассир, пайщику отчитываться нечем.
async function refresh(): Promise<void> {
  try {
    const proposal = await api.loadExpenseProposal(props.proposalHash);
    const found = proposal?.items?.find(
      (i) => i.item_hash?.toLowerCase() === props.itemHash.toLowerCase(),
    );
    item.value =
      found && found.mechanics === Zeus.ExpenseMechanics.ADVANCE ? found : null;
    if (!item.value) return;

    const all = await attachExpenseProofApi.loadExpenseFilesByItem(
      system.info.coopname,
      props.proposalHash,
      props.itemHash,
    );
    files.value = all.filter((f) => f.kind === Zeus.ExpenseFileKind.REPORT_FILE);
  } catch {
    // Панель отчёта — вспомогательная: ошибки её загрузки не прерывают реестр.
    item.value = null;
  }
}

const isReported = computed(
  () => item.value?.status === Zeus.ExpenseItemStatus.REPORTED,
);
const isAwaitingReport = computed(
  () => item.value?.status === Zeus.ExpenseItemStatus.PAID,
);

function fileLabel(file: IExpenseFile): string {
  if (file.original_filename) return file.original_filename;
  const date = file.uploaded_at
    ? new Date(file.uploaded_at).toLocaleString('ru-RU')
    : '';
  return `Чек от ${date}`;
}

// Списочные запросы файлов отдают записи без read_url (он короткоживущий) —
// свежая ссылка запрашивается по id в момент клика.
const openingId = ref<number | null>(null);
async function openFile(file: IExpenseFile): Promise<void> {
  try {
    openingId.value = file.id;
    const url = await attachExpenseProofApi.getExpenseFileReadUrl(file.id);
    if (!url) throw new Error('Не удалось получить ссылку на файл');
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    FailAlert(e);
  } finally {
    openingId.value = null;
  }
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function upload(): Promise<boolean> {
  const file = pending.value;
  if (!file) return false;
  try {
    uploading.value = true;
    const buffer = await file.arrayBuffer();
    await attachExpenseProofApi.uploadExpenseFile({
      coopname: system.info.coopname,
      proposal_hash: props.proposalHash,
      item_hash: props.itemHash,
      kind: Zeus.ExpenseFileKind.REPORT_FILE,
      mime_type: file.type,
      size_bytes: file.size,
      checksum_sha256: await sha256Hex(buffer),
      content_base64: toBase64(buffer),
      original_filename: file.name,
    });
    pending.value = null;
    return true;
  } catch (e) {
    FailAlert(e);
    return false;
  } finally {
    uploading.value = false;
  }
}

async function submitReport(): Promise<void> {
  try {
    reporting.value = true;
    await api.reportExpenseItem({
      coopname: system.info.coopname,
      proposal_hash: props.proposalHash,
      item_hash: props.itemHash,
    });
    SuccessAlert('Отчёт по авансу подан');
    await refresh();
    emit('reported');
  } catch (e) {
    FailAlert(e);
  } finally {
    reporting.value = false;
  }
}

// Выбор файла = отправка: загружаем сразу; первый чек по неотчитанному авансу
// автоматически подаёт отчёт, последующие файлы дополняют его без лишних кнопок.
watch(pending, async (file) => {
  if (!file || uploading.value) return;
  const wasAwaitingReport = isAwaitingReport.value;
  const uploaded = await upload();
  if (!uploaded) return;
  if (wasAwaitingReport) {
    await submitReport();
  } else {
    SuccessAlert('Документ приложен к отчёту');
    await refresh();
  }
});

onMounted(refresh);
</script>

<style lang="scss" scoped>
.report-advance {
  display: flex;
  flex-direction: column;
  gap: var(--p-2);
}

.files {
  display: flex;
  flex-direction: column;
  gap: var(--p-1);
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: var(--p-1);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--p-primary);
  text-decoration: none;
  font-size: var(--p-fs-body-sm);
  cursor: pointer;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}
</style>
