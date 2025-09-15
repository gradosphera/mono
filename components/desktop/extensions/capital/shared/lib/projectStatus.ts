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
