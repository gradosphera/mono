// Статусы результата синхронизированные с блокчейн контрактом
export enum ResultStatus {
  PENDING = 'pending', // Результат создан, ожидает обработки
  APPROVED = 'approved', // Результат одобрен
  AUTHORIZED = 'authorized', // Результат авторизован
  COMPLETED = 'completed', // Результат завершен
  DECLINED = 'declined', // Результат отклонен
}
