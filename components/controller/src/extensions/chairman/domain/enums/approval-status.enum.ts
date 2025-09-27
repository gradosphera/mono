import { registerEnumType } from '@nestjs/graphql';

/**
 * Перечисление статусов одобрений (approvals)
 * Синхронизировано с константами из approvals.hpp блокчейн контракта
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

registerEnumType(ApprovalStatus, {
  name: 'ApprovalStatus',
  description: 'Статус одобрения в системе CHAIRMAN',
});
