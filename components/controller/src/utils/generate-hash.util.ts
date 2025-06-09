import crypto from 'crypto';

/**
 * Генерирует уникальный sha256 хэш на основе текущего времени и случайного числа
 */
export function generateUniqueHash(): string {
  const timestamp = Date.now();
  const randomValue = Math.random().toString();
  return crypto.createHash('sha256').update(`${timestamp}-${randomValue}`).digest('hex');
}
