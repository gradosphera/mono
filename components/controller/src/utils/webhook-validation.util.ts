import crypto from 'crypto';

/**
 * Утилитарный класс для валидации webhook'ов от NOVU
 * Реализует проверку HMAC подписи согласно документации NOVU
 */
export class WebhookValidationUtil {
  /**
   * Валидация HMAC подписи webhook'а от NOVU
   * @param payload Данные webhook'а (как строка или объект)
   * @param receivedSignature Подпись из заголовка x-novu-signature
   * @param secretKey Секретный ключ для проверки подписи
   * @returns boolean - true если подпись валидна
   */
  static validateHmacSignature(
    payload: string | Record<string, any>,
    receivedSignature: string,
    secretKey: string
  ): boolean {
    if (!receivedSignature || !secretKey) {
      return false;
    }

    // Преобразуем payload в строку, если это объект
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // Вычисляем HMAC SHA256
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(payloadString, 'utf-8').digest('hex');

    // Сравниваем подписи
    return receivedSignature === expectedSignature;
  }

  /**
   * Безопасное сравнение строк (защита от timing attacks)
   * @param signature1 Первая подпись
   * @param signature2 Вторая подпись
   * @returns boolean - true если подписи равны
   */
  static safeCompare(signature1: string, signature2: string): boolean {
    if (signature1.length !== signature2.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < signature1.length; i++) {
      result |= signature1.charCodeAt(i) ^ signature2.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Валидация HMAC подписи webhook'а с безопасным сравнением
   * @param payload Данные webhook'а (как строка или объект)
   * @param receivedSignature Подпись из заголовка x-novu-signature
   * @param secretKey Секретный ключ для проверки подписи
   * @returns boolean - true если подпись валидна
   */
  static validateHmacSignatureSafe(
    payload: string | Record<string, any>,
    receivedSignature: string,
    secretKey: string
  ): boolean {
    if (!receivedSignature || !secretKey) {
      return false;
    }

    // Преобразуем payload в строку, если это объект
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // Вычисляем HMAC SHA256
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(payloadString, 'utf-8').digest('hex');

    // Безопасное сравнение подписей
    return this.safeCompare(receivedSignature, expectedSignature);
  }

  /**
   * Генерация HMAC подписи для тестирования
   * @param payload Данные для подписи
   * @param secretKey Секретный ключ
   * @returns string - HMAC подпись
   */
  static generateHmacSignature(payload: string | Record<string, any>, secretKey: string): string {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    return crypto.createHmac('sha256', secretKey).update(payloadString, 'utf-8').digest('hex');
  }
}
