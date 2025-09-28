import { ref } from 'vue';
import { api } from '../api';
import {
  useContributorStore,
} from 'app/extensions/capital/entities/Contributor/model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';
import { CapitalProgramAgreementType } from 'app/extensions/capital/shared/lib';

export type ISendAgreementInput = {
  coopname: string;
  username: string;
  agreement_type: string;
  document: any;
};

export function useSignCapitalProgramAgreement() {
  const store = useContributorStore();
  const system = useSystemStore();
  const session = useSessionStore();

  // Состояния для генерации документов
  const isGenerating = ref(false);
  const generatedDocument = ref<IGeneratedDocumentOutput | null>(null);
  const generationError = ref(false);

  // Состояния для подписания
  const isSigning = ref(false);

  const agreementInput: ISendAgreementInput = {
    coopname: '',
    username: '',
    agreement_type: CapitalProgramAgreementType,
    document: null,
  };

  // Генерация соглашения о целевой потребительской программе
  async function generateAgreement(): Promise<IGeneratedDocumentOutput | null> {
    try {
      generationError.value = false;
      generatedDocument.value = null;

      const data = {
        coopname: system.info.coopname,
        username: session.username,
        lang: 'ru',
      };

      generatedDocument.value = await api.generateCapitalizationAgreement(data);
      return generatedDocument.value;
    } catch (error) {
      console.error('Ошибка при генерации соглашения:', error);
      generationError.value = true;
      throw error;
    }
  }

  // Повторная генерация соглашения
  const regenerateAgreement = async (): Promise<IGeneratedDocumentOutput | null> => {
    isGenerating.value = true;
    try {
      return await generateAgreement();
    } finally {
      isGenerating.value = false;
    }
  };

  // Подписание и отправка соглашения
  async function signAndSendAgreement(): Promise<void> {
    isSigning.value = true;
    try {
      // Генерируем документ
      const document = await generateAgreement();
      if (!document) {
        throw new Error('Не удалось сгенерировать соглашение');
      }

      // Подписываем документ одинарной подписью
      const digitalDocument = new DigitalDocument(document);
      const signedDoc = await digitalDocument.sign(session.username);

      // Готовим данные для отправки
      agreementInput.coopname = system.info.coopname;
      agreementInput.username = session.username;
      agreementInput.document = { ...signedDoc, meta: JSON.stringify(signedDoc.meta) };

      // Отправляем соглашение
      await api.sendCapitalProgramAgreement(agreementInput);

      // Обновляем self в сторе вкладчиков после подписания
      await store.loadSelf({
        username: session.username,
      });

    } finally {
      isSigning.value = false;
    }
  }

  return {
    generateAgreement,
    regenerateAgreement,
    signAndSendAgreement,
    // Состояния генерации
    isGenerating,
    generatedDocument,
    generationError,
    // Состояния подписания
    isSigning,
  };
}
