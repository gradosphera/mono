// Статусы возврата из программы синхронизированные с блокчейн контрактом
export enum ProgramWithdrawStatus {
  CREATED = 'created', // Запрос на возврат создан
  APPROVED = 'approved', // Запрос на возврат одобрен
  UNDEFINED = 'undefined', // Статус не определен
}
