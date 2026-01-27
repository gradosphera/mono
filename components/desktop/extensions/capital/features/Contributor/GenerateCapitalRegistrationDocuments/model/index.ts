import { ref } from 'vue';
import { api, type IGenerateCapitalRegistrationDocumentsOutput } from '../api';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';

export function useGenerateCapitalRegistrationDocuments() {
  const system = useSystemStore();
  const session = useSessionStore();

  // Состояния для генерации документов
  const isGenerating = ref(false);
  const generatedDocuments = ref<IGenerateCapitalRegistrationDocumentsOutput | null>(null);
  const generationError = ref(false);

  // Генерация пачки документов
  async function generateDocuments(): Promise<IGenerateCapitalRegistrationDocumentsOutput | null> {
    try {
      isGenerating.value = true;
      generationError.value = false;
      generatedDocuments.value = null;

      const data = {
        coopname: system.info.coopname,
        username: session.username,
        lang: 'ru',
      };

      generatedDocuments.value = await api.generateCapitalRegistrationDocuments(data);
      return generatedDocuments.value;
    } catch (error) {
      console.error('Ошибка при генерации документов регистрации:', error);
      generationError.value = true;
      throw error;
    } finally {
      isGenerating.value = false;
    }
  }

  // Повторная генерация документов
  const regenerateDocuments = async (): Promise<IGenerateCapitalRegistrationDocumentsOutput | null> => {
    return await generateDocuments();
  };

  return {
    generateDocuments,
    regenerateDocuments,
    // Состояния генерации
    isGenerating,
    generatedDocuments,
    generationError,
  };
}
