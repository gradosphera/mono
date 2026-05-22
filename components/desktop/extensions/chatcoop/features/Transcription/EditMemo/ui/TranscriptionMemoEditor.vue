<template lang="pug">
.transcription-memo-editor
  WrappedEditor.transcription-memo-editor__field(
    :model-value="draft"
    label="Заметка о звонке"
    :readonly="isSaving || !canEditMemo"
    :placeholder="canEditMemo ? 'Кратко, о чём был разговор. Первая строка — одно предложение-резюме до 150 символов.' : ''"
    :min-height="180"
    @update:model-value="onInput"
  )
  .transcription-memo-editor__bar
    span.transcription-memo-editor__hint(v-if="!canEditMemo")
      | Редактирование доступно председателю и членам совета
    q-btn.transcription-memo-editor__save(
      v-if="canEditMemo"
      flat
      no-caps
      icon="fa-solid fa-floppy-disk"
      color="primary"
      :label="isSaving ? 'Сохраняем…' : 'Сохранить'"
      :loading="isSaving"
      :disable="!isDirty || isSaving"
      @click="onSave"
    )
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { FailAlert } from 'src/shared/api';
import { WrappedEditor } from 'src/shared/ui/WrappedEditor';
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

function onInput(value: string): void {
  draft.value = value;
}

async function onSave(): Promise<void> {
  if (!canEditMemo.value || !isDirty.value || isSaving.value) return;
  const ok = await save(props.transcriptionId, draft.value);
  if (!ok) {
    FailAlert('Не удалось сохранить заметку');
  }
}
</script>

<style scoped>
.transcription-memo-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transcription-memo-editor__bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-height: 24px;
}

.transcription-memo-editor__hint {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.55);
}

.body--dark .transcription-memo-editor__hint {
  color: rgba(255, 255, 255, 0.55);
}
</style>
