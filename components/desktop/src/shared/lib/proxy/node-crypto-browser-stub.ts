/**
 * Заглушка для клиентской сборки: импорт `node:crypto` в браузере не существует.
 * `Crypto.sha256` в UI использует Web Crypto API; этот модуль не должен вызываться.
 */
export function createHash(algorithm: string): never {
  void algorithm
  throw new Error('node:crypto недоступен в браузерной сборке')
}
