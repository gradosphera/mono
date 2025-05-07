import type { IGeneratedDocument, ISignatureInfo, ISignedDocument } from '../../types/document'
import { PrivateKey } from '@wharfkit/antelope'
import { Crypto } from '../crypto'

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
   * Вычисляет meta_hash, hash и signed_hash по актуальной логике в зависимости от версии.
   */
  private async calculateHashes({ meta, documentHash, signed_at, version = '1' }: { meta: any, documentHash: string, signed_at: string, version?: string }): Promise<{ meta_hash: string, hash: string, signed_hash: string }> {
    if (version === '1' || !version) {
      const meta_hash = await Crypto.sha256(JSON.stringify(meta))
      const hash = await Crypto.sha256(meta_hash + documentHash)
      const signed_hash = await Crypto.sha256(hash + signed_at)
      return { meta_hash, hash, signed_hash }
    }
    // Здесь можно добавить другие версии расчёта
    // Например:
    // if (version === '2') { ... }
    throw new Error(`Неизвестная версия алгоритма: ${version}`)
  }

  /**
   * Подписывает документ и возвращает его в формате ISignedDocument.
   * @param document Сгенерированный документ для подписи.
   * @param account Имя аккаунта подписывающего (signer)
   * @param signatureId ID подписи (обычно 1 для первой подписи)
   * @param version Версия стандарта документа
   * @returns Подписанный документ.
   */
  public async signDocument<T>(
    document: IGeneratedDocument<T>,
    account: string,
    signatureId: number = 1,
    version: string = '1',
  ): Promise<ISignedDocument<T>> {
    if (!this.wif)
      throw new Error(`Ключ не установлен, выполните вызов метода setWif перед подписью документа`)

    // Подпись хэша документа
    const digitalSignature = this.signDigest(document.hash)

    // Текущая дата в формате ISO для поля signed_at
    const signed_at = new Date().toISOString()

    // Вычисляем все хэши через отдельную функцию, передавая версию
    const { meta_hash, hash, signed_hash } = await this.calculateHashes({ meta: document.meta, documentHash: document.hash, signed_at, version })

    // Создаем информацию о подписи
    const signatureInfo: ISignatureInfo = {
      id: signatureId,
      signer: account,
      public_key: digitalSignature.public_key,
      signature: digitalSignature.signature,
      signed_at,
      signed_hash,
      meta: '',
    }

    return {
      version,
      hash,
      doc_hash: document.hash, // Заглушка, в реальном приложении doc_hash может отличаться от основного хэша
      meta_hash,
      meta: document.meta,
      signatures: [signatureInfo],
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
