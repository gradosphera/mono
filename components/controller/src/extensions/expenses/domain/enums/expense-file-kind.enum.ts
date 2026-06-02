import { registerEnumType } from '@nestjs/graphql';

/**
 * Назначение файла в MinIO-бакете `expenses:files`.
 */
export enum ExpenseFileKind {
  PAYMENT_PROOF = 'PAYMENT_PROOF',
  REPORT_FILE = 'REPORT_FILE',
  RETURN_PROOF = 'RETURN_PROOF',
}

registerEnumType(ExpenseFileKind, {
  name: 'ExpenseFileKind',
  description: 'Тип первичного файла расхода.',
});
