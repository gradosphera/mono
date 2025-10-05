import { Zeus } from '@coopenomics/sdk';

/**
 * Получение цвета статуса проекта
 */
export const getProjectStatusColor = (status: string) => {
  switch (status) {
    case Zeus.ProjectStatus.UNDEFINED:
      return 'grey';
    case Zeus.ProjectStatus.PENDING:
    case 'pending':
      return 'orange';
    case Zeus.ProjectStatus.ACTIVE:
    case 'active':
      return 'green';
    case Zeus.ProjectStatus.CLOSED:
      return 'yellow';
    case Zeus.ProjectStatus.COMPLETED:
    case 'completed':
      return 'blue';
    case Zeus.ProjectStatus.VOTING:
      return 'purple';
    case 'cancelled':
      return 'red';
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
    case 'active':
      return 'Активен';
    case Zeus.ProjectStatus.PENDING:
    case 'pending':
      return 'Ожидает';
    case Zeus.ProjectStatus.COMPLETED:
    case 'completed':
      return 'Завершен';
    case Zeus.ProjectStatus.CLOSED:
      return 'Закрыт';
    case Zeus.ProjectStatus.UNDEFINED:
      return 'Неопределен';
    case Zeus.ProjectStatus.VOTING:
      return 'На голосовании';
    case 'cancelled':
      return 'Отменен';
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
    case Zeus.ProjectStatus.COMPLETED:
    case 'completed':
      return 'fa-solid fa-check';
    case Zeus.ProjectStatus.CLOSED:
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
    case 'pending':
      return 'orange';
    case Zeus.ProjectStatus.ACTIVE:
    case 'active':
      return 'green';
    case Zeus.ProjectStatus.VOTING:
      return 'blue';
    case Zeus.ProjectStatus.COMPLETED:
    case 'completed':
      return 'purple';
    case Zeus.ProjectStatus.CLOSED:
      return 'grey';
    case Zeus.ProjectStatus.UNDEFINED:
    case 'cancelled':
    default:
      return 'grey';
  }
};
