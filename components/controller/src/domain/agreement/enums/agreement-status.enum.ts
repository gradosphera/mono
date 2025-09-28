import { registerEnumType } from '@nestjs/graphql';

/**
 * Перечисление статусов соглашений
 * Синхронизировано с константами из soviet.hpp блокчейн контракта
 */
export enum AgreementStatus {
  REGISTERED = 'registered', // Черновик соглашения
  CONFIRMED = 'confirmed', // Активное соглашение
  DECLINED = 'declined', // Отклоненное соглашение
}

registerEnumType(AgreementStatus, {
  name: 'AgreementStatus',
  description: 'Статус соглашения в системе кооператива',
});
