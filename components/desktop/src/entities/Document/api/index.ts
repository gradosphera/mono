import { sendGET } from 'src/shared/api';
import type { Cooperative } from 'cooptypes';
import type { IGetDocuments } from '../model/types';

/**
 * Загрузка документов с сервера
 * @param data параметры запроса документов
 * @returns массив документов
 */
async function loadDocuments(data: IGetDocuments): Promise<Cooperative.Document.IComplexDocument[]> {
  try {
    const response = await sendGET('/v1/documents/get-documents', data);
    return response.results as Cooperative.Document.IComplexDocument[];
  } catch (error) {
    console.error('Error loading documents:', error);
    throw error;
  }
}

export const api = {
  loadDocuments
}
