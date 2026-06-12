<template lang="pug">
.attach-proof
  .t-sm.t-muted Подтверждение оплаты
  .files(v-if='files.length')
    a.file-link(
      v-for='file in files',
      :key='file.id',
      :href='file.read_url',
      target='_blank',
      rel='noopener'
    )
      q-icon(name='attach_file', size='16px')
      span {{ fileLabel(file) }}
  FileUploader(
    v-model='pending',
    accept='image/jpeg,image/png,image/webp,image/heic,application/pdf',
    :max-size='20 * 1024 * 1024',
    title='Приложите платёжку или квитанцию',
    hint='Изображение или PDF до 20 МБ',
    :disabled='uploading'
  )
  .actions(v-if='pending')
    BaseButton(
      variant='primary',
      size='sm',
      :loading='uploading',
      @click='upload'
    ) Загрузить
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { FileUploader } from 'src/shared/ui/domain/FileUploader';
import { api, type IExpenseFile } from '../api';

const props = defineProps<{
  proposalHash: string;
  itemHash: string;
}>();

const system = useSystemStore();
const files = ref<IExpenseFile[]>([]);
const pending = ref<File | null>(null);
const uploading = ref(false);

async function refresh(): Promise<void> {
  try {
    const all = await api.loadExpenseFilesByItem(
      system.info.coopname,
      props.proposalHash,
      props.itemHash,
    );
    files.value = all.filter((f) => f.kind === Zeus.ExpenseFileKind.PAYMENT_PROOF);
  } catch {
    // список файлов — вспомогательный; ошибки загрузки списка не прерывают кассира
    files.value = [];
  }
}

function fileLabel(file: IExpenseFile): string {
  const date = file.uploaded_at ? new Date(file.uploaded_at).toLocaleString('ru-RU') : '';
  return `Платёжка от ${date}`;
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

async function upload(): Promise<void> {
  const file = pending.value;
  if (!file) return;
  try {
    uploading.value = true;
    const buffer = await file.arrayBuffer();
    await api.uploadExpenseFile({
      coopname: system.info.coopname,
      proposal_hash: props.proposalHash,
      item_hash: props.itemHash,
      kind: Zeus.ExpenseFileKind.PAYMENT_PROOF,
      mime_type: file.type,
      size_bytes: file.size,
      checksum_sha256: await sha256Hex(buffer),
      content_base64: toBase64(buffer),
    });
    pending.value = null;
    SuccessAlert('Подтверждение оплаты приложено');
    await refresh();
  } catch (e) {
    FailAlert(e);
  } finally {
    uploading.value = false;
  }
}

onMounted(refresh);
</script>

<style lang="scss" scoped>
.attach-proof {
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
  color: var(--p-primary);
  text-decoration: none;
  font-size: var(--p-fs-body-sm);

  &:hover {
    text-decoration: underline;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
