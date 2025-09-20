/**
 * Генерирует инициалы из display name
 * @param displayName - имя для генерации инициалов
 * @returns инициалы (максимум 3 буквы) или '-' если имя пустое
 */
export function generateInitials(displayName: string | null | undefined): string {
  if (!displayName) return '-';

  // Разделяем по пробелам и берем первые буквы
  const words = displayName.trim().split(/\s+/);
  const initials = words
    .slice(0, 3) // Максимум 3 слова
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials || '-';
}
