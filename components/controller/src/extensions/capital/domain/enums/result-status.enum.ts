import { registerEnumType } from '@nestjs/graphql';
// Статусы результата синхронизированные с блокчейн контрактом
export enum ResultStatus {
  PENDING = 'pending', // Результат создан, ожидает обработки
  APPROVED = 'approved', // Результат одобрен
  AUTHORIZED = 'authorized', // Результат авторизован
  COMPLETED = 'completed', // Результат завершен
  DECLINED = 'declined', // Результат отклонен
  UNDEFINED = 'undefined', // Статус не определен
}

registerEnumType(ResultStatus, {
  name: 'ResultStatus',
  description: 'Статус результата в системе CAPITAL',
});
