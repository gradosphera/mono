import { DigitalDocument, type IGeneratedDocument } from 'src/entities/Document';
import { api } from '../api';
import { COOPNAME } from 'src/shared/config';

export const useSignAgreement = () => {

  const signAgreement = async(username: string, agreement: IGeneratedDocument) => {
    const document = new DigitalDocument(agreement);
    await document.sign();

    if (!document.signedDocument)
      throw new Error('Ошибка подписи документа')

    api.sendAgreement({
      coopname: COOPNAME,
      administrator: '',
      username,
      agreement_type: '',
      program_id: '',
      draft_registry_id: document.signedDocument.meta.registry_id,
      document: {...document.signedDocument, meta: JSON.stringify(document.signedDocument.meta)}
    })
  }

  return {
    signAgreement
  }
}
