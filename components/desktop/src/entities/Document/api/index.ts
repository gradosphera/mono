import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetDocuments, ZGetDocumentsResult } from '../model/types';

/**
 * Загрузка документов с сервера
 * @param data параметры запроса документов
 * @returns результат запроса с пагинацией и документами
 */
async function loadDocuments(data: IGetDocuments): Promise<ZGetDocumentsResult> {
  const { getDocuments: output } = await client.Query(
    Queries.Documents.GetDocuments.query,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

export const api = {
  loadDocuments
}
