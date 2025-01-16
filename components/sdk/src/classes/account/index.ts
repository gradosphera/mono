import { PrivateKey } from '@wharfkit/antelope'

/**
 * Интерфейс для ключевой пары.
 */
interface IKeyPair {
  private_key: string
  public_key: string
}

/**
 * Класс `Account` генерирует объект с именем, приватным и публичным ключами.
 *
 * @example
 * ```ts
 * const account = new Account();
 * console.log(account);
 * // {
 * //   name: "abcdxyzuvwrs",
 * //   privateKey: "5JxyzABC1234567890defGHIJKLMNopqRSTUV",
 * //   publicKey: "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5SozEZ8i8jUBS6yX79y6"
 * // }
 * ```
 */
export class Account {
  public username: string
  public private_key: string
  public public_key: string

  constructor() {
    this.username = Account.generateUsername()
    const keys = Account.generateKeys()
    this.private_key = keys.private_key
    this.public_key = keys.public_key
  }

  /**
   * Генерирует случайное имя длиной 12 символов, состоящее только из букв.
   * @returns Случайное имя.
   */
  private static generateUsername(): string {
    let result = ''
    const possible = 'abcdefghijklmnopqrstuvwxyz'
    for (let i = 0; i < 12; i++) {
      result += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return result
  }

  /**
   * Генерирует пару ключей (приватный и публичный) с использованием библиотеки @wharfkit/antelope.
   * @returns Объект с приватным и публичным ключами.
   */
  private static generateKeys(): IKeyPair {
    const private_key_data = PrivateKey.generate('K1')
    const public_key = private_key_data.toPublic().toString()
    const private_key = private_key_data.toWif()

    return {
      private_key,
      public_key,
    }
  }
}
