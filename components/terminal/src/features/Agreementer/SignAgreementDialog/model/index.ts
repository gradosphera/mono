import { DigitalDocument, type IGeneratedDocument } from 'src/shared/lib/document';
import { api } from '../api';
import { COOPNAME } from 'src/shared/config';

export const useSignAgreement = () => {

  const signAgreement = async(username: string, agreement_type: string, agreement: IGeneratedDocument) => {
    const document = new DigitalDocument(agreement);
    await document.sign();

    if (!document.signedDocument)
      throw new Error('Ошибка подписи документа')


    await api.sendAgreement({
      coopname: COOPNAME,
      administrator: COOPNAME,
      username,
      agreement_type,
      document: {...document.signedDocument, meta: JSON.stringify(document.signedDocument.meta)}
    })
  }

  return {
    signAgreement
  }
}
