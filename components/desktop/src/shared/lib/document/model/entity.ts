import type { IGenerate, IGeneratedDocument } from './types'
import { api } from '../api';
import { useGlobalStore } from 'src/shared/store';
import type { IDocument, IMetaDocument } from 'src/shared/lib/types/document';
import type { Cooperative } from 'cooptypes';
import { Classes } from '@coopenomics/sdk';

export type ZGeneratedDocument = Cooperative.Document.ZGeneratedDocument

export const useSignDocument = () => {
  const globalStore = useGlobalStore()

  /**
   * Подписывает документ
   */
  const signDocument = async(
    document: ZGeneratedDocument,
    account: string,
    signatureId = 1,
  ): Promise<Cooperative.Document.ISignedDocument2> => {
    if (!document)
      throw new Error('Документ на подпись не предоставлен')

    const wifKey = globalStore.wif?.toString();
    if (!wifKey)
      throw new Error('Приватный ключ не установлен');

    // Используем класс из SDK для подписи
    const docSigner = new Classes.Document(wifKey);


    // Получаем доступ к Document классу из SDK
    return await docSigner.signDocument(document, account, signatureId);
  }

  return {
    signDocument
  }
}

export class DigitalDocument {
  public data: IGeneratedDocument | undefined
  public signedDocument: IDocument | undefined

  constructor(document?: IGeneratedDocument){
    this.data = document
  }

  async generate<T extends IGenerate>(data: T, options?: Cooperative.Document.IGenerationOptions): Promise<IGeneratedDocument> {
    this.data = await api.generateDocument(data, options);
    return this.data;
  }

  /**
   * Подписывает документ
   */
  async sign<T extends IMetaDocument>(account: string, signatureId = 1): Promise<IDocument<T>> {
    const globalStore = useGlobalStore()
    if (!this.data)
      throw new Error('Ошибка генерации документа')

    const wifKey = globalStore.wif?.toString();
    if (!wifKey)
      throw new Error('Приватный ключ не установлен');

    // Используем класс из SDK для подписи
    const docSigner = new Classes.Document(wifKey);

    // Подписываем документ с использованием SDK
    const signedDoc = await docSigner.signDocument<T>(this.data, account, signatureId);

    this.signedDocument = signedDoc;

    return signedDoc;
  }
}
