import type { IGeneratedDocument, ISignatureInfo, ISignatureInfoInput, ISignedChainDocument, ISignedDocument } from '../../types/document'
import { PrivateKey, PublicKey, Signature } from '@wharfkit/antelope'
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
  private async calculateHashes({ meta, documentHash, signed_at, version = '1.0.0' }: { meta: any, documentHash: string, signed_at: string, version?: string }): Promise<{ meta_hash: string, hash: string, signed_hash: string }> {
    if (version === '1.0.0' || !version) {
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
   * @param existingSignedDocuments Массив уже подписанных документов для объединения подписей
   * @returns Подписанный документ.
   */
  public async signDocument(
    document: IGeneratedDocument,
    account: string,
    signatureId: number = 1,
    existingSignedDocuments?: ISignedDocument[],
  ): Promise<ISignedDocument> {
    const version = '1.0.0'

    if (!this.wif)
      throw new Error(`Ключ не установлен, выполните вызов метода setWif перед подписью документа`)

    // Текущая дата в формате EOSIO
    const now = new Date()
    const signed_at = now.toISOString().split('.')[0]

    // Вычисляем все хэши через отдельную функцию, передавая версию
    const { meta_hash, hash, signed_hash } = await this.calculateHashes({ meta: document.meta, documentHash: document.hash, signed_at, version })

    // Собираем все существующие подписи из переданных документов
    const allSignatures: ISignatureInfoInput[] = []

    if (existingSignedDocuments && existingSignedDocuments.length > 0) {
      for (const existingDoc of existingSignedDocuments) {
        // Проверяем совместимость хэшей
        if (existingDoc.doc_hash.toUpperCase() !== document.hash.toUpperCase()) {
          throw new Error(`Хэш документа не совпадает с существующим подписанным документом: ${existingDoc.doc_hash.toUpperCase()} !== ${document.hash.toUpperCase()}`)
        }

        if (existingDoc.meta_hash.toUpperCase() !== meta_hash.toUpperCase()) {
          throw new Error(`Хэш метаданных не совпадает с существующим подписанным документом: ${existingDoc.meta_hash.toUpperCase()} !== ${meta_hash.toUpperCase()}`)
        }

        // Верифицируем существующие подписи
        for (const existingSignature of existingDoc.signatures) {
          if (!Document.validateSignature(existingSignature)) {
            throw new Error(`Недействительная подпись от ${existingSignature.signer} с ID ${existingSignature.id}`)
          }
        }

        // Добавляем подписи к общему массиву
        allSignatures.push(...existingDoc.signatures.map((sig) => {
          // Исключаем лишние поля, которые не нужны для SignatureInfoInput
          const { is_valid, signer_certificate, ...cleanedSig } = sig
          return cleanedSig as ISignatureInfo
        }))
      }
    }

    // Проверяем, что signatureId не дублируется
    const existingIds = allSignatures.map(sig => sig.id)
    if (existingIds.includes(signatureId)) {
      throw new Error(`Подпись с ID ${signatureId} уже существует`)
    }

    // Подпись хэша документа
    const digitalSignature = this.signDigest(signed_hash)

    // Создаем информацию о новой подписи
    const newSignatureInfo: ISignatureInfoInput = {
      id: signatureId,
      signer: account,
      public_key: digitalSignature.public_key,
      signature: digitalSignature.signature,
      signed_at,
      signed_hash,
      meta: JSON.stringify({}),
    }

    // Добавляем новую подпись к существующим
    allSignatures.push(newSignatureInfo)

    // Сортируем подписи по ID
    allSignatures.sort((a, b) => a.id - b.id)

    return {
      version,
      hash,
      doc_hash: document.hash, // TODO: после миграции фабрики заменить здесь на doc_hash взятый из фабрики
      meta_hash,
      meta: document.meta,
      signatures: allSignatures,
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

  /**
   * Статический метод для валидации подписанного документа.
   * Проверяет корректность дат, подписей и их порядок.
   *
   * @param document Подписанный документ для проверки
   * @returns true если документ валиден, иначе false
   */
  public static validateDocument(document: ISignedDocument): boolean {
    try {
      const { signatures } = document

      // Проверка наличия подписей
      if (!signatures || signatures.length === 0) {
        return false
      }

      // Проверка сортировки и последовательности id
      for (let i = 0; i < signatures.length; i++) {
        // Проверка, что id начинаются с 0 или 1 и увеличиваются последовательно
        if ((signatures[i].id !== i && signatures[i].id !== i + 1)) {
          return false
        }

        // Проверка подписи
        try {
          const publicKeyObj = PublicKey.from(signatures[i].public_key)
          const signatureObj = Signature.from(signatures[i].signature)
          const verified = signatureObj.verifyDigest(signatures[i].signed_hash, publicKeyObj)

          if (!verified) {
            return false
          }
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (_) {
          return false
        }
      }

      return true
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_) {
      return false
    }
  }

  /**
   * Статический метод для преобразования подписанного документа в формат для блокчейна.
   * Преобразует метаданные в строки JSON.
   *
   * @param document Подписанный документ для финализации
   * @returns Документ в формате для отправки в блокчейн
   */
  public static finalize(document: ISignedDocument): ISignedChainDocument {
    // Преобразуем meta документа в строку JSON
    const stringifiedMeta = JSON.stringify(document.meta)

    // Преобразуем meta в каждой подписи
    const finalizedSignatures = document.signatures.map(sig => ({
      ...sig,
      meta: typeof sig.meta === 'object' ? JSON.stringify(sig.meta) : sig.meta,
    }))

    return {
      version: document.version,
      hash: document.hash,
      doc_hash: document.doc_hash,
      meta_hash: document.meta_hash,
      meta: stringifiedMeta,
      signatures: finalizedSignatures,
    }
  }

  /**
   * Статический метод для преобразования документа из формата блокчейна в стандартный формат.
   * Преобразует строки JSON метаданных в объекты.
   *
   * @param document Документ в формате блокчейна
   * @returns Стандартный подписанный документ
   */
  public static parse(document: ISignedChainDocument): ISignedDocument {
    // Преобразуем строку meta документа в объект
    const parsedMeta = typeof document.meta === 'string' ? JSON.parse(document.meta) : document.meta

    // Преобразуем meta в каждой подписи из строки в объект, если это строка
    const parsedSignatures = document.signatures.map(sig => ({
      ...sig,
      meta: typeof sig.meta === 'string' && sig.meta !== '' ? JSON.parse(sig.meta) : sig.meta,
    }))

    return {
      version: document.version,
      hash: document.hash,
      doc_hash: document.doc_hash,
      meta_hash: document.meta_hash,
      meta: parsedMeta,
      signatures: parsedSignatures,
    }
  }

  /**
   * Статический метод для валидации отдельной подписи документа.
   * Проверяет корректность даты и цифровой подписи.
   *
   * @param signature Информация о подписи для проверки
   * @returns true если подпись валидна, иначе false
   */
  public static validateSignature(signature: ISignatureInfo): boolean {
    try {
      // Проверка подписи
      const publicKeyObj = PublicKey.from(signature.public_key)
      const signatureObj = Signature.from(signature.signature)
      const verified = signatureObj.verifyDigest(signature.signed_hash, publicKeyObj)

      return verified
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_) {
      return false
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
