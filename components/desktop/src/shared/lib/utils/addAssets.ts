/**
 * Суммирует два актива (IAsset) с одинаковой валютой
 * @param asset1 - первый актив (например "100.00 RUB")
 * @param asset2 - второй актив (например "50.00 RUB")
 * @returns сумма активов в формате IAsset (например "150.00 RUB")
 */
export const addAssets = (asset1: string, asset2: string): string => {
  if (!asset1 || asset1 === '0') return asset2 || '0.00';
  if (!asset2 || asset2 === '0') return asset1 || '0.00';

  // Извлекаем числовые значения и символы валюты
  const parseAsset = (asset: string) => {
    const parts = asset.trim().split(' ');
    const cleanValue = parts[0] || asset;
    const currencySymbol = parts[1] || '';
    const numericValue = cleanValue.replace(/[^\d.-]/g, '');
    const numValue = parseFloat(numericValue);
    return { value: isNaN(numValue) ? 0 : numValue, currency: currencySymbol };
  };

  const parsed1 = parseAsset(asset1);
  const parsed2 = parseAsset(asset2);

  // Проверяем, что валюты совпадают
  if (parsed1.currency && parsed2.currency && parsed1.currency !== parsed2.currency) {
    console.warn('Attempting to add assets with different currencies:', asset1, asset2);
    return asset1; // Возвращаем первый актив в случае ошибки
  }

  const value1 = parsed1.value;
  const value2 = parsed2.value;

  const sum = value1 + value2;
  const currencySymbol = parsed1.currency || parsed2.currency;

  // Форматируем результат как строку без пробелов для совместимости с formatAsset2Digits
  const formattedNumber = sum.toFixed(2);

  return currencySymbol
    ? `${formattedNumber} ${currencySymbol}`
    : formattedNumber;
};
