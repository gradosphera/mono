import { createHmac } from 'crypto';
import config from '~/config/config';

/**
 * Генерирует HMAC hash для subscriber_id
 * @param subscriberId - ID подписчика для которого генерится hash
 */
export function generateSubscriberHash(subscriberId: string): string {
  // Используем server_secret как ключ для HMAC
  const hmac = createHmac('sha256', config.novu.api_key);
  hmac.update(subscriberId);
  return hmac.digest('hex');
}

/**
 * Проверяет валидность subscriber hash
 * @param subscriberId - ID подписчика
 * @param hash - Проверяемый hash
 */
export function validateSubscriberHash(subscriberId: string, hash: string): boolean {
  const expectedHash = generateSubscriberHash(subscriberId);
  return expectedHash === hash;
}
