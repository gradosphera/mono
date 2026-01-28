import { ref } from 'vue';
import { api } from '../api';
import { useSignDocument } from 'src/shared/lib/document/model/entity';
import { useSessionStore } from 'src/entities/Session/model';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import type { ISignActAsContributorInput, ISignActAsChairmanInput } from './types';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { useResultStore } from 'app/extensions/capital/entities/Result/model';

export * from './types';

export function useSignAct() {
  const { signDocument } = useSignDocument();
  const { username } = useSessionStore();
  const segmentStore = useSegmentStore();
  const resultStore = useResultStore();

  const isLoading = ref(false);

  // Подписание акта как пайщик (одинарная подпись)
  const signActAsContributor = async (
    segment: ISegment,
    coopname: string,
  ): Promise<ISegment> => {
    isLoading.value = true;
    try {
      if (!segment.username) {
        throw new Error('Имя пользователя не найдено');
      }

      // Получаем result для извлечения result_hash
      const result = await resultStore.loadResultByFilters(segment.username, segment.project_hash);
      if (!result) {
        throw new Error('Результат не найден');
      }
      // Генерируем акт
      const generatedDocument = await api.generateResultContributionAct({
        username: segment.username,
        result_hash: result.result_hash
      });
      // Подписываем документ одинарной подписью (signatureId = 1)
      const signedDocument = await signDocument(
        generatedDocument,
        username,
        1, // signatureId = 1 для одинарной подписи
      );
      // Отправляем подписанный акт
      const input: ISignActAsContributorInput = {
        coopname,
        result_hash: result.result_hash,
        act: signedDocument,
      };
      const updatedSegment = await api.signActAsContributor(input);

      // Обновляем сегмент в сторе напрямую
      if (updatedSegment) {
        segmentStore.addSegmentToList(segment.project_hash, updatedSegment);
      }

      return updatedSegment;
    } finally {
      isLoading.value = false;
    }
  };

  // Подписание акта как председатель (двойная подпись)
  const signActAsChairman = async (
    segment: ISegment,
    coopname: string,
  ): Promise<ISegment> => {
    isLoading.value = true;
    try {
      if (!segment.username) {
        throw new Error('Имя пользователя не найдено');
      }

      // Получаем result для извлечения result_hash
      const result = await resultStore.loadResultByFilters(segment.username, segment.project_hash);
      if (!result) {
        throw new Error('Результат не найден');
      }
      // Генерируем акт
      const generatedDocument = await api.generateResultContributionAct({
        result_hash: result.result_hash,
        username: segment.username,
      });

      // Для председателя нужна двойная подпись, но поскольку акт только генерируется,
      // existingSignedDocuments будет пустым для первой подписи
      const doubleSignedDocument = await signDocument(
        generatedDocument,
        username,
        1, // Начинаем с первой подписи
      );

      // Отправляем подписанный акт
      const input: ISignActAsChairmanInput = {
        coopname,
        result_hash: result.result_hash,
        act: doubleSignedDocument,
      };

      const updatedSegment = await api.signActAsChairman(input);

      // Обновляем сегмент в сторе напрямую
      if (updatedSegment) {
        segmentStore.addSegmentToList(segment.project_hash, updatedSegment);
      }

      return updatedSegment;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    signActAsContributor,
    signActAsChairman,
    isLoading,
  };
}
