<template lang="pug">
q-input.transcription-memo-editor(
  v-model="draft"
  type="textarea"
  autogrow
  dense
  label="Заметка о звонке"
  :readonly="isSaving || !canEditMemo"
  :hint="canEditMemo ? undefined : 'Редактирование доступно председателю и членам совета'"
  :placeholder="canEditMemo ? 'Кратко, о чём был разговор…' : undefined"
)
  template(v-if="isDirty && canEditMemo" #append)
    q-btn.transcription-memo-editor__save(
      flat
      dense
      round
      icon="fa-solid fa-floppy-disk"
      color="primary"
      :loading="isSaving"
      :disable="isSaving"
      @click.stop="onSave"
      aria-label="Сохранить заметку"
    )
      q-tooltip Сохранить
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { FailAlert } from 'src/shared/api';
import { useSessionStore } from 'src/entities/Session';
import { useSaveTranscriptionMemo } from '../model';

const props = defineProps<{
  transcriptionId: string;
  memo: string;
}>();

const sessionStore = useSessionStore();
const { isChairman, isMember } = storeToRefs(sessionStore);
const canEditMemo = computed(() => isChairman.value || isMember.value);

const { save, isSaving } = useSaveTranscriptionMemo();
const draft = ref(props.memo);

watch(
  () => [props.transcriptionId, props.memo] as const,
  ([, memo]) => {
    draft.value = memo;
  }
);

const isDirty = computed(() => draft.value !== props.memo);

async function onSave(): Promise<void> {
  if (!canEditMemo.value || !isDirty.value || isSaving.value) return;
  const ok = await save(props.transcriptionId, draft.value);
  if (!ok) {
    FailAlert('Не удалось сохранить заметку');
  }
}
</script>

<style scoped>
.transcription-memo-editor :deep(.q-field__append) {
  align-self: flex-start;
  padding-top: 8px;
}

.transcription-memo-editor__save {
  flex-shrink: 0;
}
</style>
