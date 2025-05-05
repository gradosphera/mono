import type { IGenerate, IGeneratedDocument } from './types'
import { api } from '../api';
import { useGlobalStore } from 'src/shared/store';
import type { IObjectedDocument } from 'src/shared/lib/types/document';
import type { Cooperative } from 'cooptypes';
import { Classes } from '@coopenomics/sdk';
import { createHash } from 'crypto';

export type ZGeneratedDocument = Cooperative.Document.ZGeneratedDocument

/**
 * Вычисляет объединенный хэш на основе doc_hash и meta_hash
 */
function calculateCombinedHash(docHash: string, metaHash: string): string {
  const combinedString = `${docHash}${metaHash}`;
  return createHash('sha256').update(combinedString).digest('hex');
}

export const useSignDocument = () => {
  const globalStore = useGlobalStore()

  /**
   * Подписывает документ
   */
  const signDocument = async(
    document: ZGeneratedDocument,
    account: string,
    signatureId = 1,
    version = '1.0'
  ): Promise<Cooperative.Document.ISignedDocument2> => {
    if (!document)
      throw new Error('Документ на подпись не предоставлен')

    const wifKey = globalStore.wif?.toString();
    if (!wifKey)
      throw new Error('Приватный ключ не установлен');

    // Используем класс из SDK для подписи
    const docSigner = new Classes.Document(wifKey);

    // Используем хэш документа как doc_hash
    const doc_hash = document.hash;

    // Создаем хэш метаданных
    const meta_str = JSON.stringify(document.meta);
    const meta_hash = createHash('sha256').update(meta_str).digest('hex');

    // Вычисляем общий хэш на основе doc_hash и meta_hash
    const hash = calculateCombinedHash(doc_hash, meta_hash);

    // Заменяем хэш в документе для правильной подписи
    const docToSign = {
      ...document,
      hash,
    };

    // Получаем доступ к Document классу из SDK
    return await docSigner.signDocument(docToSign, account, signatureId, version);
  }

  return {
    signDocument
  }
}

export class DigitalDocument {
  public data: IGeneratedDocument | undefined
  public signedDocument: IObjectedDocument | undefined

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
  async sign(account: string, signatureId = 1, version = '1.0'): Promise<IObjectedDocument> {
    const globalStore = useGlobalStore()
    if (!this.data)
      throw new Error('Ошибка генерации документа')

    const wifKey = globalStore.wif?.toString();
    if (!wifKey)
      throw new Error('Приватный ключ не установлен');

    // Используем класс из SDK для подписи
    const docSigner = new Classes.Document(wifKey);

    // Используем хэш документа как doc_hash
    const doc_hash = this.data.hash;

    // Создаем хэш метаданных
    const meta_str = JSON.stringify(this.data.meta);
    const meta_hash = createHash('sha256').update(meta_str).digest('hex');

    // Вычисляем общий хэш на основе doc_hash и meta_hash
    const hash = calculateCombinedHash(doc_hash, meta_hash);

    // Заменяем хэш в документе для правильной подписи
    const docToSign = {
      ...this.data,
      hash,
    };

    // Подписываем документ с использованием SDK
    const signedDoc = await docSigner.signDocument(docToSign, account, signatureId, version);

    this.signedDocument = signedDoc;

    return signedDoc;
  }
}
