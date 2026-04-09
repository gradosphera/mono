import { ref } from 'vue';
import { updateTranscriptionMemo } from '../api';
import { useTranscriptionStore } from '../../../../entities/Transcription/model';

/**
 * Сохранение memo: мутация в API фичи, затем подстановка ответа в кэш стора сущности (без повторных запросов).
 */
export function useSaveTranscriptionMemo() {
  const transcriptionStore = useTranscriptionStore();
  const isSaving = ref(false);

  async function save(transcriptionId: string, memo: string): Promise<boolean> {
    if (isSaving.value) return false;
    isSaving.value = true;
    try {
      const row = await updateTranscriptionMemo({ id: transcriptionId, memo });
      transcriptionStore.applyTranscriptionHeadFromServer(row);
      return true;
    } catch (err) {
      console.error('Failed to update transcription memo:', err);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  return { save, isSaving };
}
