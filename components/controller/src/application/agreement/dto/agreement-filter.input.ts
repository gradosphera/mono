import { InputType, Field, Int } from '@nestjs/graphql';
import { AgreementStatus } from '~/domain/agreement/enums/agreement-status.enum';

/**
 * GraphQL Input DTO для фильтрации списка соглашений
 */
@InputType('AgreementFilter', {
  description: 'Фильтр для поиска соглашений',
})
export class AgreementFilterInput {
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

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по типу соглашения',
  })
  type?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Фильтр по ID программы',
  })
  program_id?: number;

  @Field(() => [AgreementStatus], {
    nullable: true,
    description: 'Фильтр по статусам соглашений',
  })
  statuses?: AgreementStatus[];

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
}
