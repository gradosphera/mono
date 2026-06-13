import { Field, ObjectType } from '@nestjs/graphql';

/**
 * Результат подачи заявления на выход из кооператива.
 */
@ObjectType('MembershipExitResult')
export class MembershipExitResultDTO {
  @Field(() => String, { description: 'Хеш созданного процесса выхода' })
  exit_hash!: string;
}
