import { ref } from 'vue';
import { api } from '../api';
import { useSignDocument } from 'src/shared/lib/document/model/entity';
import { useSessionStore } from 'src/entities/Session/model';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import type { ISignActAsContributorInput, ISignActAsChairmanInput } from './types';

export * from './types';

export function useSignAct() {
  const { signDocument } = useSignDocument();
  const { username } = useSessionStore();

  const isLoading = ref(false);

  // Подписание акта как пайщик (одинарная подпись)
  const signActAsContributor = async (
    segment: ISegment,
    coopname: string,
  ): Promise<void> => {
    isLoading.value = true;
    try {
      if (!segment.username) {
        throw new Error('Имя пользователя не найдено');
      }

      // Генерируем акт
      const generatedDocument = await api.generateResultContributionAct({
        coopname,
        username: segment.username,
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
        result_hash: '',
        act: signedDocument,
      } ;

      await api.signActAsContributor(input);
    } finally {
      isLoading.value = false;
    }
  };

  // Подписание акта как председатель (двойная подпись)
  const signActAsChairman = async (
    segment: ISegment,
    coopname: string,
  ): Promise<void> => {
    isLoading.value = true;
    try {
      if (!segment.username) {
        throw new Error('Имя пользователя не найдено');
      }

      // Генерируем акт
      const generatedDocument = await api.generateResultContributionAct({
        coopname,
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
        result_hash: '',
        act: doubleSignedDocument,
      };

      await api.signActAsChairman(input);
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
