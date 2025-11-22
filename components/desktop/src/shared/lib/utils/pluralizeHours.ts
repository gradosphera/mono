/**
 * Общая функция для склонения русских слов по количеству
 * @param count - количество
 * @param titles - массив форм слова [единственное, двойственное, множественное]
 * @returns правильно склоненное слово
 */
export const pluralize = (count: number, titles: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
};

/**
 * Склонение слова "час" в зависимости от количества
 * @param count - количество часов
 * @returns правильно склоненное слово
 */
export const pluralizeHours = (count: number): string => {
  return pluralize(count, ['час', 'часа', 'часов']);
};

/**
 * Склонение слова "день" в зависимости от количества
 * @param count - количество дней
 * @returns правильно склоненное слово
 */
export const pluralizeDays = (count: number): string => {
  return pluralize(count, ['день', 'дня', 'дней']);
};

/**
 * Склонение слова "аккаунт" в зависимости от количества
 * @param count - количество аккаунтов
 * @returns правильно склоненное слово
 */
export const pluralizeAccounts = (count: number): string => {
  return pluralize(count, ['аккаунт', 'аккаунта', 'аккаунтов']);
};

/**
 * Форматирование количества часов с правильным склонением
 * @param hours - количество часов
 * @returns строка вида "5 часов"
 */
export const formatHours = (hours: number): string => {
  return `${hours} ${pluralizeHours(hours)}`;
};
