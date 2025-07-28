/**
 * Форматирует актив с двумя знаками после запятой и извлекает символ валюты
 * @param value - строка с активом (например "1000000 EOS")
 * @returns отформатированная строка (например "100.00 EOS")
 */
export const formatAsset2Digits = (value: string): string => {
  if (!value || value === '0') return '0.00';

  // Разделяем значение по пробелу для извлечения символа валюты
  const parts = value.trim().split(' ');
  const cleanValue = parts[0] || value;
  const currencySymbol = parts[1] || '';

  // Убираем символ валюты и форматируем как число
  const numericValue = cleanValue.replace(/[^\d.-]/g, '');
  const numValue = parseFloat(numericValue);

  if (isNaN(numValue)) return '0.00';

  const formattedNumber = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue / 10000); // Деление на 10000 для EOS формата

  return currencySymbol
    ? `${formattedNumber} ${currencySymbol}`
    : formattedNumber;
};
