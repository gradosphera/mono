import { Zeus } from '@coopenomics/sdk';

/**
 * Получение цвета статуса задачи
 */
export const getIssueStatusColor = (status: string) => {
  switch (status) {
    case Zeus.IssueStatus.TODO:
      return 'grey';
    case Zeus.IssueStatus.IN_PROGRESS:
      return 'blue';
    case Zeus.IssueStatus.BACKLOG:
      return 'orange';
    case Zeus.IssueStatus.DONE:
      return 'green';
    case Zeus.IssueStatus.CANCELED:
      return 'red';
    default:
      return 'grey';
  }
};

/**
 * Получение текста статуса задачи
 */
export const getIssueStatusLabel = (status: string) => {
  switch (status) {
    case Zeus.IssueStatus.TODO:
      return 'К выполнению';
    case Zeus.IssueStatus.IN_PROGRESS:
      return 'В работе';
    case Zeus.IssueStatus.BACKLOG:
      return 'Бэклог';
    case Zeus.IssueStatus.DONE:
      return 'Выполнена';
    case Zeus.IssueStatus.CANCELED:
      return 'Отменена';
    default:
      return status;
  }
};
