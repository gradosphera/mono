import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

/**
 * GraphQL Output DTO для конфигурации CAPITAL контракта
 */
@ObjectType('CapitalConfig', {
  description: 'Конфигурация CAPITAL контракта кооператива',
})
export class ConfigOutputDTO {
  @Field(() => String, {
    description: 'Название кооператива',
  })
  coopname!: string;

  @Field(() => Float, {
    description: 'Процент бонуса координатора',
  })
  coordinator_bonus_percent!: number;

  @Field(() => Float, {
    description: 'Процент расходов',
  })
  expense_pool_percent!: number;

  @Field(() => Int, {
    description: 'Срок действия приглашения координатора в днях',
  })
  coordinator_invite_validity_days!: number;

  @Field(() => Int, {
    description: 'Период голосования в днях',
  })
  voting_period_in_days!: number;

  @Field(() => Float, {
    description: 'Процент голосования авторов',
  })
  authors_voting_percent!: number;

  @Field(() => Float, {
    description: 'Процент голосования создателей',
  })
  creators_voting_percent!: number;
}
