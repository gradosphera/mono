import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useContributorStore,
  type IRegisterContributorOutput,
} from 'app/extensions/capital/entities/Contributor/model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

export type IRegisterContributorInput =
  Mutations.Capital.RegisterContributor.IInput['data'];

export function useRegisterContributor() {
  const store = useContributorStore();
  const system = useSystemStore();
  const session = useSessionStore();

  // Состояния для генерации документов
  const isGenerating = ref(false);
  const generatedDocument = ref<IGeneratedDocumentOutput | null>(null);
  const generationError = ref(false);

  const initialRegisterContributorInput: IRegisterContributorInput = {
    coopname: '',
    username: '',
    contract: {
      doc_hash: '',
      hash: '',
      meta: {
        block_num: 0,
        coopname: '',
        created_at: '',
        generator: '',
        lang: '',
        links: [],
        registry_id: 0,
        timezone: '',
        title: '',
        username: '',
        version: '',
      },
      meta_hash: '',
      signatures: [],
      version: '',
    },
    rate_per_hour: '0.0000 RUB',
    about: '',
  };

  const registerContributorInput = ref<IRegisterContributorInput>({
    ...initialRegisterContributorInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IRegisterContributorInput>,
    initial: IRegisterContributorInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function registerContributor(
    data: IRegisterContributorInput,
  ): Promise<IRegisterContributorOutput> {
    const transaction = await api.registerContributor(data);

    // Обновляем список вкладчиков после регистрации
    await store.loadContributors({});

    // Сбрасываем registerContributorInput после выполнения registerContributor
    resetInput(registerContributorInput, initialRegisterContributorInput);

    return transaction;
  }

  // Генерация документа участия
  async function generateDocument(): Promise<IGeneratedDocumentOutput | null> {
    try {
      generationError.value = false;
      generatedDocument.value = null;

      const data = {
        coopname: system.info.coopname,
        username: session.username,
        lang: 'ru',
      };

      generatedDocument.value = await api.generateGenerationAgreement(data);
      return generatedDocument.value;
    } catch (error) {
      console.error('Ошибка при генерации договора:', error);
      generationError.value = true;
      throw error;
    }
  }

  // Повторная генерация документа
  const regenerateDocument = async (): Promise<IGeneratedDocumentOutput | null> => {
    isGenerating.value = true;
    try {
      return await generateDocument();
    } finally {
      isGenerating.value = false;
    }
  };

  // Генерация и подпись документа с последующей регистрацией
  async function registerContributorWithGeneratedDocument(): Promise<IRegisterContributorOutput> {
    isGenerating.value = true;
    try {
      // Генерируем документ
      const document = await generateDocument();
      if (!document) {
        throw new Error('Не удалось сгенерировать документ');
      }

      // Подписываем документ
      const digitalDocument = new DigitalDocument(document);
      const signedDoc = await digitalDocument.sign(session.username);

      // Заполняем данные для регистрации
      registerContributorInput.value.coopname = system.info.coopname;
      registerContributorInput.value.username = session.username;
      registerContributorInput.value.contract = signedDoc;

      // Регистрируем вкладчика
      return await registerContributor(registerContributorInput.value);
    } finally {
      isGenerating.value = false;
    }
  }

  return {
    registerContributor,
    registerContributorInput,
    // Новые функции для работы с документами
    generateDocument,
    regenerateDocument,
    registerContributorWithGeneratedDocument,
    // Состояния генерации
    isGenerating,
    generatedDocument,
    generationError,
  };
}
