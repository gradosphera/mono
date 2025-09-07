// Статусы долга синхронизированные с блокчейн контрактом
export enum DebtStatus {
  PENDING = 'pending', // Долг создан, ожидает одобрения
  APPROVED = 'approved', // Долг одобрен
  ACTIVE = 'active', // Долг активен
  SETTLED = 'settled', // Долг погашен
  CANCELLED = 'cancelled', // Долг отменен
  UNDEFINED = 'undefined', // Статус не определен
}
