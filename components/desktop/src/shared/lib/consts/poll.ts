/**
 * Константы интервалов для периодического обновления данных (poll)
 * Все интервалы указаны в миллисекундах
 */

// Быстрое обновление для динамичных данных (списки, голосования)
export const POLL_INTERVAL_FAST = 10000; // 10 секунд

// Среднее обновление для основных страниц
export const POLL_INTERVAL_MEDIUM = 20000; // 20 секунд

// Медленное обновление для статичных страниц
export const POLL_INTERVAL_SLOW = 30000; // 30 секунд

// Типы страниц для poll интервалов
export const POLL_INTERVALS = {
  // Быстрое обновление
  FAST: POLL_INTERVAL_FAST,

  // Среднее обновление
  MEDIUM: POLL_INTERVAL_MEDIUM,

  // Медленное обновление
  SLOW: POLL_INTERVAL_SLOW,
} as const;

export type PollIntervalType = keyof typeof POLL_INTERVALS;
