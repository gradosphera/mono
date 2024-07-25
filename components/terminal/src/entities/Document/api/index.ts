import type { IGenerate, IGeneratedDocument } from '../model';

import { sendPOST } from 'src/shared/api';

async function generateDocument(data: IGenerate): Promise<IGeneratedDocument> {
  return await sendPOST('/v1/documents/generate', data);
}

export const api = {
  generateDocument,
};
