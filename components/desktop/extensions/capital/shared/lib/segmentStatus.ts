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
    default:
      return 'grey';
  }
};

/**
 * Получение текста статуса сегмента
 */
export const getSegmentStatusLabel = (status: string) => {
  switch (status) {
    case Zeus.SegmentStatus.GENERATION:
      return 'Генерация результата';
    case Zeus.SegmentStatus.READY:
      return 'Готов к внесению результата';
    case Zeus.SegmentStatus.STATEMENT:
      return 'Заявление на рассмотрении председателя';
    case Zeus.SegmentStatus.APPROVED:
      return 'Одобрено председателем, ожидается решение совета';
    case Zeus.SegmentStatus.AUTHORIZED:
      return 'Авторизовано советом, ожидается подпись вкладчика';
    case Zeus.SegmentStatus.ACT1:
      return 'Акт подписан вкладчиком, ожидается подпись председателя';
    case Zeus.SegmentStatus.CONTRIBUTED:
      return 'Результат принят';
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
    default:
      return 'fa-regular fa-circle-question';
  }
};
