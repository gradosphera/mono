/**
 * Форматирует имя контрибьютора в формат "Фамилия И.О."
 * @param displayName - полное имя для форматирования
 * @returns отформатированное имя или исходное имя если форматирование невозможно
 */
export function formatContributorName(displayName: string | null | undefined): string {
  if (!displayName || !displayName.trim()) {
    return displayName || '';
  }

  // Разделяем по пробелам
  const parts = displayName.trim().split(/\s+/);

  if (parts.length === 1) {
    // Только одно слово - возвращаем как есть
    return parts[0];
  }

  if (parts.length === 2) {
    // Имя и фамилия - "Фамилия И."
    const [firstName, lastName] = parts;
    return `${lastName} ${firstName.charAt(0).toUpperCase()}.`;
  }

  if (parts.length >= 3) {
    // Имя, отчество, фамилия - "Фамилия И.О."
    const [lastName, firstName, middleName] = parts;
    return `${lastName} ${firstName.charAt(0).toUpperCase()}.${middleName.charAt(0).toUpperCase()}.`;
  }

  return displayName;
}
