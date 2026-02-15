import { Zeus } from '@coopenomics/sdk';

/**
 * Получение цвета статуса сегмента
 */
export const getSegmentStatusColor = (status: string) => {
  switch (status) {
    case Zeus.SegmentStatus.GENERATION:
      return 'orange';
    case Zeus.SegmentStatus.READY:
      return 'blue';
    case Zeus.SegmentStatus.STATEMENT:
      return 'purple';
    case Zeus.SegmentStatus.APPROVED:
      return 'teal';
    case Zeus.SegmentStatus.AUTHORIZED:
      return 'cyan';
    case Zeus.SegmentStatus.ACT1:
      return 'indigo';
    case Zeus.SegmentStatus.CONTRIBUTED:
      return 'green';
    case Zeus.SegmentStatus.FINALIZED:
      return 'blue';
    default:
      return 'grey';
  }
};

/**
 * Получение текста статуса сегмента
 */
export const getSegmentStatusLabel = (status: string, isCompleted = false, segment?: any) => {
  // Если сегмент завершен, показываем специальный статус
  if (isCompleted) {
    return 'Сегмент получен';
  }
  console.log('status', status);
  switch (status) {
    case Zeus.SegmentStatus.GENERATION:
      return 'Ожидаем пересчета стоимости результата интеллектуальной деятельности';
    case Zeus.SegmentStatus.READY:
      // Для чистых инвесторов показываем другой текст
      if (segment && isPureInvestor(segment)) {
        return 'Доля в объекте авторских прав получена';
      }
      return 'Готов к внесению результата результата интеллектуальной деятельности';
    case Zeus.SegmentStatus.STATEMENT:
      return 'Заявление на предварительном рассмотрении председателя';
    case Zeus.SegmentStatus.APPROVED:
      return 'Одобрено председателем, ожидается решение совета о приёме';
    case Zeus.SegmentStatus.AUTHORIZED:
      return 'Получено решение совета, ожидаем подпись пайщика на акте приёма-передачи доли в объекте авторских прав';
    case Zeus.SegmentStatus.ACT1:
      return 'Акт приёма-передачи подписан пайщиком, ожидаем подпись председателя';
    case Zeus.SegmentStatus.CONTRIBUTED:
      return 'Результат интеллектуальной деятельности принят';
    case Zeus.SegmentStatus.FINALIZED:
      return 'Доля в объекте авторских прав получена';
    default:
      return 'Неизвестный статус';
  }
};

/**
 * Получение иконки статуса сегмента
 */
export const getSegmentStatusIcon = (status: string) => {
  switch (status) {
    case Zeus.SegmentStatus.GENERATION:
      return 'fa-solid fa-spinner';
    case Zeus.SegmentStatus.READY:
      return 'fa-solid fa-clock';
    case Zeus.SegmentStatus.STATEMENT:
      return 'fa-solid fa-file-invoice';
    case Zeus.SegmentStatus.APPROVED:
      return 'fa-solid fa-user-check';
    case Zeus.SegmentStatus.AUTHORIZED:
      return 'fa-solid fa-users-gear';
    case Zeus.SegmentStatus.ACT1:
      return 'fa-solid fa-file-signature';
    case Zeus.SegmentStatus.CONTRIBUTED:
      return 'fa-solid fa-circle-check';
    case Zeus.SegmentStatus.FINALIZED:
      return 'fa-solid fa-trophy';
    default:
      return 'fa-regular fa-circle-question';
  }
};

/**
 * Проверка, является ли сегмент чистым инвестором
 * Чистый инвестор - участник только с ролью инвестора, без других ролей
 */
export const isPureInvestor = (segment: any): boolean => {
  return segment.is_investor &&
         !segment.is_creator &&
         !segment.is_author &&
         !segment.is_coordinator &&
         !segment.is_propertor &&
         !segment.is_contributor;
};
