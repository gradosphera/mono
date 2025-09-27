import { InputType, Field } from '@nestjs/graphql';
import { ApprovalStatus } from '../../domain/enums/approval-status.enum';

/**
 * GraphQL Input DTO для фильтрации списка одобрений
 */
@InputType('ApprovalFilter', {
  description: 'Фильтр для поиска одобрений',
})
export class ApprovalFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по названию кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по имени пользователя',
  })
  username?: string;

  @Field(() => [ApprovalStatus], {
    nullable: true,
    description: 'Фильтр по статусам одобрений',
  })
  statuses?: ApprovalStatus[];

  @Field(() => Date, {
    nullable: true,
    description: 'Фильтр по дате создания (от)',
  })
  created_from?: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'Фильтр по дате создания (до)',
  })
  created_to?: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Поиск по хешу одобрения',
  })
  approval_hash?: string;
}
