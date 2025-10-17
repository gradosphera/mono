/**
 * Склонение слова "час" в зависимости от количества
 * @param count - количество часов
 * @returns правильно склоненное слово
 */
export const pluralizeHours = (count: number): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const titles = ['час', 'часа', 'часов'];
  return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
};

/**
 * Форматирование количества часов с правильным склонением
 * @param hours - количество часов
 * @returns строка вида "5 часов"
 */
export const formatHours = (hours: number): string => {
  return `${hours} ${pluralizeHours(hours)}`;
};
