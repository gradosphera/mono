import type { Cooperative } from 'cooptypes'
import type { IGeneratedDocument, ISignedDocument } from '../../types/document'
import type { ModelTypes } from '../../zeus/index'
import { PrivateKey } from '@wharfkit/antelope'

/**
 * Класс для управления и подписания документов с использованием WIF-ключа.
 *
 * @example
 * ```typescript
 * const wifKey = "your-wif-private-key";
 * const docSigner = new Document(wifKey);
 *
 * const generatedDoc: IGeneratedDocument = {
 *   full_title: "Пример документа",
 *   html: "<p>Это пример документа</p>",
 *   hash: "hash_of_document",
 *   meta: { author: "Автор документа" },
 *   binary: "binary_data"
 * };
 *
 * const signedDoc = await docSigner.signDocument(generatedDoc);
 * console.log(signedDoc);
 *
 * // Замена WIF-ключа
 * docSigner.setWif("new-wif-private-key");
 * ```
 */
export class Document {
  private wif?: PrivateKey

  /**
   * Инициализация класса Document с WIF-ключом.
   * @param wifKey WIF-ключ, используемый для подписи.
   */
  constructor(wifKey?: string) {
    if (wifKey)
      this.wif = PrivateKey.fromString(wifKey)
  }

  /**
   * Замена текущего WIF-ключа на новый.
   * @param wifKey Новый WIF-ключ.
   */
  public setWif(wifKey: string): void {
    this.wif = PrivateKey.fromString(wifKey)
  }

  /**
   * Подписывает документ и возвращает его в формате ISignedDocument.
   * @param document Сгенерированный документ для подписи.
   * @returns Подписанный документ.
   */
  public async signDocument<T>(document: IGeneratedDocument<T>): Promise<ISignedDocument<T>> {
    const digitalSignature = this.signDigest(document.hash)

    return {
      hash: document.hash,
      public_key: digitalSignature.public_key,
      signature: digitalSignature.signature,
      meta: document.meta,
    }
  }

  /**
   * Подписывает хэш (digest) документа и проверяет подпись.
   * @param digest Хэш документа для подписи.
   * @returns Детали подписи.
   */
  private signDigest(digest: string): IMessageSignature {
    if (!this.wif)
      throw new Error(`Ключ не установлен, выполните вызов метода setWif перед подписью документа`)

    // Подпись хэша документа
    const signed = this.wif.signDigest(digest)
    // Проверка подписи с использованием публичного ключа
    const verified = signed.verifyDigest(digest, this.wif.toPublic())

    if (!verified) {
      throw new Error('Ошибка проверки подписи')
    }

    return {
      message: digest,
      signature: signed.toString(),
      public_key: this.wif.toPublic().toString(),
    }
  }
}

/**
 * Интерфейс для данных подписи сообщения.
 */
interface IMessageSignature {
  message: string // Сообщение (хэш), которое было подписано
  signature: string // Цифровая подпись сообщения
  public_key: string // Публичный ключ, использованный для подписи
}
