import type { SovietContract } from 'cooptypes'
import { PrivateKey, PublicKey, Signature } from '@wharfkit/antelope'
import { Crypto } from '../crypto'

/**
 * Интерфейс для подписи голоса
 */
interface IVoteSignature {
  version: string
  signed_at: string
  signed_hash: string
  signature: string
  public_key: string
}

/**
 * Интерфейс для данных голосования (соответствует параметрам транзакции)
 */
export type IVoteData = SovietContract.Actions.Decisions.VoteFor.IVoteForDecision

/**
 * Класс для управления и подписания голосов членов совета с использованием WIF-ключа.
 *
 * @example
 * ```typescript
 * const wifKey = "your-wif-private-key";
 * const voteSigner = new Vote(wifKey);
 *
 * // Голосование за решение
 * const voteForResult = await voteSigner.voteFor("coop1", "user1", 123);
 * console.log(voteForResult);
 *
 * // Голосование против решения
 * const voteAgainstResult = await voteSigner.voteAgainst("coop1", "user1", 123);
 * console.log(voteAgainstResult);
 * ```
 */
export class Vote {
  private wif?: PrivateKey

  /**
   * Инициализация класса Vote с WIF-ключом.
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
   * Создает подпись для голосования
   *
   * @param decision_id ID решения
   * @returns Объект подписи голосования
   */
  private async signVote(decision_id: number): Promise<IVoteSignature> {
    if (!this.wif)
      throw new Error('Ключ не установлен, выполните вызов метода setWif перед подписью голоса')

    // Версия используемого стандарта подписи
    const version = '1.0.0'

    // Текущая дата в формате EOSIO
    const now = new Date()
    const signed_at = now.toISOString().split('.')[0]

    // Создаем signed_hash из decision_id и timestamp
    // В реальных условиях здесь должна быть более сложная логика формирования хэша
    const signed_hash = await Crypto.sha256(String(decision_id) + signed_at)

    // Подписываем хэш
    const signature = this.wif.signDigest(signed_hash)

    // Проверка подписи
    const verified = signature.verifyDigest(signed_hash, this.wif.toPublic())
    if (!verified) {
      throw new Error('Ошибка проверки подписи')
    }

    return {
      version,
      signed_at,
      signed_hash,
      signature: signature.toString(),
      public_key: this.wif.toPublic().toString(),
    }
  }

  /**
   * Подписывает голос "ЗА" решение
   *
   * @param coopname Имя кооператива
   * @param username Имя пользователя (члена совета)
   * @param decision_id ID решения
   * @returns Объект с параметрами для вызова транзакции votefor
   */
  public async voteFor(coopname: string, username: string, decision_id: number): Promise<IVoteData> {
    const voteSignature = await this.signVote(decision_id)

    return {
      version: voteSignature.version,
      coopname,
      username,
      decision_id,
      signed_at: voteSignature.signed_at,
      signed_hash: voteSignature.signed_hash,
      signature: voteSignature.signature,
      public_key: voteSignature.public_key,
    }
  }

  /**
   * Подписывает голос "ПРОТИВ" решения
   *
   * @param coopname Имя кооператива
   * @param username Имя пользователя (члена совета)
   * @param decision_id ID решения
   * @returns Объект с параметрами для вызова транзакции voteagainst
   */
  public async voteAgainst(coopname: string, username: string, decision_id: number): Promise<IVoteData> {
    const voteSignature = await this.signVote(decision_id)

    return {
      version: voteSignature.version,
      coopname,
      username,
      decision_id,
      signed_at: voteSignature.signed_at,
      signed_hash: voteSignature.signed_hash,
      signature: voteSignature.signature,
      public_key: voteSignature.public_key,
    }
  }

  /**
   * Статический метод для валидации подписи голоса.
   *
   * @param data Объект с данными голосования
   * @returns true если подпись валидна, иначе false
   */
  public static validateVote(data: IVoteData): boolean {
    try {
      // Проверка версии
      if (data.version !== '1.0.0') {
        return false
      }

      // Проверка, что время подписи не в будущем
      const signedAtDate = new Date(data.signed_at)
      if (signedAtDate > new Date()) {
        return false
      }

      // Проверка подписи
      const publicKeyObj = PublicKey.from(data.public_key)
      const signatureObj = Signature.from(data.signature)
      return signatureObj.verifyDigest(data.signed_hash, publicKeyObj)
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_) {
      return false
    }
  }

  /**
   * Асинхронная версия метода проверки подписи голоса, которая также проверяет корректность signedHash.
   *
   * @param data Объект с данными голосования
   * @returns Promise<boolean>, который разрешается в true если подпись валидна, иначе false
   */
  public static async validateVoteWithHashCheck(data: IVoteData): Promise<boolean> {
    try {
      // Проверка версии
      if (data.version !== '1.0.0') {
        return false
      }

      // Проверка, что время подписи не в будущем
      const signedAtDate = new Date(data.signed_at)
      if (signedAtDate > new Date()) {
        return false
      }

      // Проверка корректности signedHash
      const calculatedSignedHash = await Crypto.sha256(String(data.decision_id) + data.signed_at)
      if (calculatedSignedHash !== data.signed_hash) {
        return false
      }

      // Проверка подписи
      const publicKeyObj = PublicKey.from(data.public_key)
      const signatureObj = Signature.from(data.signature)
      return signatureObj.verifyDigest(data.signed_hash, publicKeyObj)
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_) {
      return false
    }
  }
}
