import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetDocuments, ZComplexDocument } from '../model/types';

/**
 * Загрузка документов с сервера
 * @param data параметры запроса документов
 * @returns массив документов
 */
async function loadDocuments(data: IGetDocuments): Promise<ZComplexDocument> {
  const { [Queries.Documents.GetDocuments.name]: output } = await client.Query(
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
