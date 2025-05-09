import { DigitalDocument, type IGeneratedDocument } from 'src/shared/lib/document';
import { api } from '../api';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session/model';

export const useSignAgreement = () => {
  const { info } = useSystemStore()
  const { username } = useSessionStore()

  const signAgreement = async(agreement_type: string, agreement: IGeneratedDocument) => {
    const document = new DigitalDocument(agreement);
    await document.sign(username);

    if (!document.signedDocument)
      throw new Error('Ошибка подписи документа')

    // Проверяем типы и преобразуем документ
    await api.sendAgreement({
      coopname: info.coopname,
      administrator: info.coopname,
      username,
      agreement_type,
      document: {...document.signedDocument, meta: JSON.stringify(document.signedDocument.meta)}
    })
  }

  return {
    signAgreement
  }
}
