import { Zeus } from '@coopenomics/sdk';

/**
 * Получение цвета статуса проекта
 */
export const getProjectStatusColor = (status: string) => {
  switch (status) {
    case Zeus.ProjectStatus.UNDEFINED:
      return 'grey';
    case Zeus.ProjectStatus.PENDING:
      return 'orange';
    case Zeus.ProjectStatus.ACTIVE:
      return 'green';
    case Zeus.ProjectStatus.CANCELLED:
      return 'red';
    case Zeus.ProjectStatus.RESULT:
      return 'blue';
    case Zeus.ProjectStatus.VOTING:
      return 'purple';
    default:
      return 'grey';
  }
};

/**
 * Получение текста статуса проекта
 */
export const getProjectStatusLabel = (status: string) => {
  switch (status) {
    case Zeus.ProjectStatus.ACTIVE:
      return 'Активен';
    case Zeus.ProjectStatus.PENDING:
      return 'Ожидает';
    case Zeus.ProjectStatus.RESULT:
      return 'Приёмка';
    case Zeus.ProjectStatus.CANCELLED:
      return 'Отменён';
    case Zeus.ProjectStatus.UNDEFINED:
      return 'Неопределен';
    case Zeus.ProjectStatus.VOTING:
      return 'Голосование';
    default:
      return status;
  }
};

/**
 * Получение иконки статуса проекта для отображения в виде кругляшка
 */
export const getProjectStatusIcon = (status: string) => {
  switch (status) {
    case Zeus.ProjectStatus.PENDING:
    case 'pending':
      return 'fa-solid fa-pause';
    case Zeus.ProjectStatus.ACTIVE:
    case 'active':
      return 'fa-solid fa-play';
    case Zeus.ProjectStatus.VOTING:
      return 'fa-solid fa-check-to-slot';
    case Zeus.ProjectStatus.RESULT:
    case 'result':
      return 'fa-solid fa-check';
    case Zeus.ProjectStatus.CANCELLED:
      return 'fa-solid fa-lock';
    case Zeus.ProjectStatus.UNDEFINED:
    case 'cancelled':
    default:
      return 'fa-regular fa-circle';
  }
};

/**
 * Получение цвета кругляшка статуса проекта
 */
export const getProjectStatusDotColor = (status: string) => {
  switch (status) {
    case Zeus.ProjectStatus.PENDING:
      return 'grey';
    case Zeus.ProjectStatus.ACTIVE:
      return 'green';
    case Zeus.ProjectStatus.VOTING:
      return 'green';
    case Zeus.ProjectStatus.RESULT:
      return 'green';
    case Zeus.ProjectStatus.CANCELLED:
      return 'grey';
    case Zeus.ProjectStatus.UNDEFINED:
    default:
      return 'grey';
  }
};
