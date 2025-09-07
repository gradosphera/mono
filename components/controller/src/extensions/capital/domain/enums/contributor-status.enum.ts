// Статусы вкладчика синхронизированные с блокчейн контрактом
export enum ContributorStatus {
  PENDING = 'pending', // Вкладчик зарегистрирован, ожидает одобрения
  APPROVED = 'approved', // Вкладчик одобрен
  ACTIVE = 'active', // Вкладчик активен
  INACTIVE = 'inactive', // Вкладчик неактивен
  UNDEFINED = 'undefined', // Статус не определен
}
