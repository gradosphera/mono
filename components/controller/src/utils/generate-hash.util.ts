import crypto from 'crypto';

/**
 * Генерирует уникальный sha256 хэш на основе текущего времени и случайного числа
 */
export function generateUniqueHash(): string {
  const timestamp = Date.now();
  const randomValue = Math.random().toString();
  return crypto.createHash('sha256').update(`${timestamp}-${randomValue}`).digest('hex');
}

export function generateRandomHash(): string {
  return generateUniqueHash();
}

/**
 * Генерирует sha256 хэш от строки
 * @param input Входная строка для хеширования
 * @returns string SHA256 хэш
 */
export function generateHashFromString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
