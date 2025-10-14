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
      return 'Генерация';
    case Zeus.SegmentStatus.READY:
      return 'Готов к внесению результата';
    case Zeus.SegmentStatus.CONTRIBUTED:
      return 'Результат внесён и принят';
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
      return 'fa-solid fa-cog';
    case Zeus.SegmentStatus.READY:
      return 'fa-solid fa-clock';
    case Zeus.SegmentStatus.CONTRIBUTED:
      return 'fa-solid fa-check';
    default:
      return 'fa-regular fa-circle';
  }
};
