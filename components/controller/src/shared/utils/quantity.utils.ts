import config from '~/config/config';

/**
 * Утилиты для работы с количествами и символами в платежной системе
 */
export class QuantityUtils {
  /**
   * Проверяет, поддерживается ли символ системой
   * @param symbol Символ для проверки
   * @returns true если символ поддерживается
   */
  static isSupportedSymbol(symbol: string): boolean {
    return symbol === config.blockchain.root_symbol || symbol === config.blockchain.root_govern_symbol;
  }

  /**
   * Получает precision для конкретного символа
   * @param symbol Символ валюты
   * @returns Precision для символа
   */
  static getPrecisionForSymbol(symbol: string): number {
    if (symbol === config.blockchain.root_symbol) {
      return config.blockchain.root_precision;
    } else if (symbol === config.blockchain.root_govern_symbol) {
      return config.blockchain.root_govern_precision;
    } else {
      throw new Error(
        `Неподдерживаемый символ: ${symbol}. Поддерживаются только: ${config.blockchain.root_symbol}, ${config.blockchain.root_govern_symbol}`
      );
    }
  }

  /**
   * Валидирует символ и выбрасывает ошибку если не поддерживается
   * @param symbol Символ для валидации
   */
  static validateSymbol(symbol: string): void {
    if (!this.isSupportedSymbol(symbol)) {
      throw new Error(
        `Неподдерживаемый символ: ${symbol}. Поддерживаются только: ${config.blockchain.root_symbol}, ${config.blockchain.root_govern_symbol}`
      );
    }
  }

  /**
   * Форматирует количество с символом для блокчейна
   * @param amount Числовое значение
   * @param symbol Символ валюты
   * @returns Отформатированная строка quantity для блокчейна
   */
  static formatQuantityForBlockchain(amount: number, symbol: string): string {
    this.validateSymbol(symbol);

    if (isNaN(amount) || amount < 0) {
      throw new Error(`Некорректное числовое значение: ${amount}`);
    }

    const precision = this.getPrecisionForSymbol(symbol);
    const formattedAmount = amount.toFixed(precision);

    return `${formattedAmount} ${symbol}`;
  }

  /**
   * Форматирует количество с символом из числа и строки символа в единую строку
   * @param amount Числовое значение
   * @param symbol Символ валюты
   * @returns Строка в формате "число символ"
   */
  static combineQuantityAndSymbol(amount: number, symbol: string): string {
    this.validateSymbol(symbol);

    if (isNaN(amount) || amount < 0) {
      throw new Error(`Некорректное числовое значение: ${amount}`);
    }

    return `${amount} ${symbol}`;
  }

  /**
   * Парсит строку quantity в число и символ
   * @param quantity Строка в формате "число символ"
   * @returns Объект с числом и символом
   */
  static parseQuantityString(quantity: string): { amount: number; symbol: string } {
    const parts = quantity.split(' ');
    if (parts.length !== 2) {
      throw new Error(`Неверный формат quantity: ${quantity}. Ожидается "число символ"`);
    }

    const [amountStr, symbol] = parts;
    const amount = parseFloat(amountStr);

    if (isNaN(amount)) {
      throw new Error(`Некорректное числовое значение в quantity: ${amountStr}`);
    }

    this.validateSymbol(symbol);

    return { amount, symbol };
  }
}
