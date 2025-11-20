/**
 * Утилиты для форматирования сумм
 */
export class AmountFormatterUtils {
  /**
   * Форматирует сумму в читаемый формат с 2 десятичными знаками
   * @param amountStr Строка в формате "число валюта" (например, "10.0000 RUB")
   * @returns Отформатированная строка в формате "число,валюта" (например, "10,00 RUB")
   * @throws Error если формат некорректный
   */
  static formatAmount(amountStr: string): string {
    const parts = amountStr.split(' ');
    if (parts.length !== 2) {
      throw new Error(`Неверный формат суммы: ${amountStr}. Ожидается "число валюта"`);
    }

    const [amountPart, currency] = parts;
    const amount = parseFloat(amountPart);

    if (isNaN(amount)) {
      throw new Error(`Некорректное числовое значение в сумме: ${amountPart}`);
    }

    // Форматируем число с 2 десятичными знаками и запятой как разделителем
    const formattedAmount = amount.toFixed(2).replace('.', ',');

    return `${formattedAmount} ${currency}`;
  }
}
