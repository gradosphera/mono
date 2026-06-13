import { registerEnumType } from '@nestjs/graphql';

/**
 * Статус процесса выхода пайщика из кооператива (registrator::exits.status).
 */
export enum MembershipExitStatus {
  // Заявление подано, ожидает решения совета.
  PENDING = 'pending',
  // Совет одобрил, идёт возврат паевого взноса (зарезервирован, исходящий платёж).
  AUTHORIZED = 'authorized',
}

registerEnumType(MembershipExitStatus, {
  name: 'MembershipExitStatus',
  description: 'Статус процесса выхода пайщика из кооператива',
});
