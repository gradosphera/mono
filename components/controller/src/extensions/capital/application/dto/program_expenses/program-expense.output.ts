import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ExpenseProposalStatus } from '~/extensions/expenses/domain/enums/expense-proposal-status.enum';

/** Owner-callback из шасси (зеркало InterExpenseCallbackHandler). */
@ObjectType('CapitalProgramExpenseCallback')
export class ProgramExpenseCallbackOutputDTO {
  @Field(() => String) contract!: string;
  @Field(() => String) action!: string;
  @Field(() => String) data!: string;
}

/** Item в выводе (зеркало InterExpenseItem). */
@ObjectType('CapitalProgramExpenseItem')
export class ProgramExpenseItemOutputDTO {
  @Field(() => String) item_hash!: string;
  @Field(() => Int) mechanics!: number;
  @Field(() => Int) recipient_type!: number;
  @Field(() => String) recipient!: string;
  @Field(() => String) description!: string;
  @Field(() => String) planned_amount!: string;
  @Field(() => String) actual_amount!: string;
  @Field(() => Int) status!: number;
}

/**
 * Программный расход в проекции Капитала — те же данные шасси, спроецированные
 * под consumer-extension. Capital НЕ хранит свой mirror items/total — берёт через
 * inter-порт INTER_EXPENSE_CHASSIS.
 */
@ObjectType('CapitalProgramExpense')
export class ProgramExpenseOutputDTO {
  @Field(() => String) coopname!: string;
  @Field(() => String) expense_hash!: string;
  @Field(() => String) creator!: string;
  @Field(() => String) operation_code!: string;
  @Field(() => String) source_wallet!: string;
  @Field(() => ExpenseProposalStatus) status!: ExpenseProposalStatus;
  @Field(() => ProgramExpenseCallbackOutputDTO, { nullable: true })
  callback?: ProgramExpenseCallbackOutputDTO;
  @Field(() => [ProgramExpenseItemOutputDTO]) items!: ProgramExpenseItemOutputDTO[];
  @Field(() => String) total_planned!: string;
  @Field(() => String) total_actual!: string;
  @Field(() => String) created_at!: string;
  @Field(() => String) updated_at!: string;
}
