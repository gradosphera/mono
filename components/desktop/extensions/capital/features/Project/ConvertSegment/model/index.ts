import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useSignDocument } from 'src/shared/lib/document/model/entity';
import { useSessionStore } from 'src/entities/Session/model';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { useSystemStore } from 'src/entities/System/model';
import { formatToAsset } from 'src/shared/lib/utils/formatToAsset';

export type IConvertSegmentInput =
  Mutations.Capital.ConvertSegment.IInput['data'];

export function useConvertSegment() {
  const { signDocument } = useSignDocument();
  const { username } = useSessionStore();
  const { governSymbol, governPrecision } = useSystemStore();

  // Функция для форматирования суммы в EOSIO asset строку
  const formatToEosioAsset = (amount: number): string => {
    return formatToAsset(amount, governSymbol, governPrecision);
  };

  // Функция для генерации, подписания и конвертации сегмента
  async function convertSegmentWithDocumentGeneration(
    segmentData: {
      coopname: string;
      username: string;
      project_hash: string;
      wallet_amount: number;
      capital_amount: number;
    }
  ) {
    // 1. Генерируем документ заявления о конвертации
    const generatedDocument = await api.generateConvertStatement({
      coopname: segmentData.coopname,
      username: segmentData.username,
    });

    // 2. Подписываем документ
    const signedDocument = await signDocument(
      generatedDocument,
      username,
      1, // signatureId = 1 для одинарной подписи
    );

    // 3. Получаем сегмент с подписанным документом
    const convert_hash = await generateUniqueHash();
    const convertData: IConvertSegmentInput = {
      coopname: segmentData.coopname,
      username: segmentData.username,
      project_hash: segmentData.project_hash,
      convert_hash,
      wallet_amount: formatToEosioAsset(segmentData.wallet_amount),
      capital_amount: formatToEosioAsset(segmentData.capital_amount),
      project_amount: formatToEosioAsset(0), // Всегда 0
      convert_statement: signedDocument,
    };

    const transaction = await api.convertSegment(convertData);
    return transaction;
  }

  return { convertSegmentWithDocumentGeneration };
}
