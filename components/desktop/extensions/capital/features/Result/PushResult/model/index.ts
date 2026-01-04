import { ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useResultStore,
  type IPushResultOutput,
} from 'app/extensions/capital/entities/Result/model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type IPushResultInput = Mutations.Capital.PushResult.IInput['data'];

export function usePushResult() {
  const store = useResultStore();
  const system = useSystemStore();
  const session = useSessionStore();
  const segmentStore = useSegmentStore();
  const projectStore = useProjectStore();

  // Состояния для генерации документов
  const isGenerating = ref(false);
  const generationError = ref(false);

  async function pushResult(
    data: IPushResultInput,
  ): Promise<IPushResultOutput> {
    const transaction = await api.pushResult(data);

    // Обновляем список результатов после добавления
    await store.loadResults({});

    return transaction;
  }

  // Генерация заявления на паевой взнос
  async function generateResultContributionStatement(): Promise<IGeneratedDocumentOutput | null> {
    try {
      generationError.value = false;

      const data = {
        coopname: system.info.coopname,
        username: session.username,
      };

      const document = await api.generateResultContributionStatement(data);
      return document;
    } catch (error) {
      console.error('Ошибка при генерации заявления на паевой взнос:', error);
      generationError.value = true;
      throw error;
    }
  }

  // Создание результата с сгенерированным и подписанным заявлением
  async function pushResultWithGeneratedStatement(
    projectHash: string,
    username: string,
    contributionAmount: string,
    debtAmount: string,
  ): Promise<IPushResultOutput> {

    // Генерируем заявление
    const document = await generateResultContributionStatement();
    if (!document) {
      throw new Error('Не удалось сгенерировать заявление');
    }

    // Подписываем документ
    const digitalDocument = new DigitalDocument(document);
    const signedDoc = await digitalDocument.sign(session.username);

    // Создаем объект результата
    const resultData: IPushResultInput = {
      coopname: system.info.coopname,
      username: username,
      contribution_amount: contributionAmount,
      debt_amount: debtAmount,
      debt_hashes: [], // Пока пустой массив, так как поле отсутствует в сегменте
      project_hash: projectHash,
      statement: signedDoc,
    };

    // Отправляем результат
    const updatedSegment = await pushResult(resultData);

    // Обновляем сегмент в сторе напрямую
    if (updatedSegment) {
      segmentStore.addSegmentToList(projectHash, updatedSegment);
    }

    // Обновляем проект в списке
    try {
      await projectStore.loadProject({
        hash: projectHash,
      });
    } catch (error) {
      console.warn('Не удалось обновить проект после внесения результата:', error);
    }

    return updatedSegment;
  }

  return {
    pushResult,
    // Новые функции для работы с заявлениями
    generateResultContributionStatement,
    pushResultWithGeneratedStatement,
    // Состояния генерации
    isGenerating,
    generationError,
  };
}
