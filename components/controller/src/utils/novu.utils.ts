import { randomBytes, createHmac } from 'crypto';
import config from '~/config/config';
import { User } from '~/models';

/**
 * Генерирует уникальный subscriber_id для NOVU с проверкой на дублирование
 * @param coopname Название кооператива
 * @param maxRetries Максимальное количество попыток (по умолчанию 5)
 * @returns Уникальный subscriber_id
 */
export async function generateSubscriberId(coopname: string, maxRetries = 5): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Генерируем случайный subscriber_id в формате: coopname:16_hex_chars
    const randomId = randomBytes(16).toString('hex');
    const subscriberId = `${coopname}:${randomId}`;

    // Проверяем, что такой subscriber_id не существует
    const existingUser = await User.findOne({ subscriber_id: subscriberId });

    if (!existingUser) {
      return subscriberId;
    }

    // Если subscriber_id уже существует, пробуем еще раз
    console.warn(`Дублирование subscriber_id: ${subscriberId}, попытка ${attempt + 1}/${maxRetries}`);
  }

  throw new Error(`Не удалось сгенерировать уникальный subscriber_id после ${maxRetries} попыток`);
}

/**
 * Генерирует уникальный subscriber_id для NOVU (синхронная версия - deprecated)
 * @deprecated Используйте generateSubscriberId() вместо этой функции
 */
export function generateSubscriberIdSync(coopname: string): string {
  // Генерируем случайный subscriber_id в формате: coopname:16_hex_chars
  const randomId = randomBytes(16).toString('hex');
  return `${coopname}:${randomId}`;
}

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
