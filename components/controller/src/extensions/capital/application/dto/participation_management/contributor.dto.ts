import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ContributorStatus } from '../../../domain/enums/contributor-status.enum';
import { DocumentAggregateDTO } from '~/application/document/dto/document-aggregate.dto';
import { BaseOutputDTO } from '~/shared/dto/base.dto';

/**
 * GraphQL Output DTO для сущности Contributor
 */
@ObjectType('CapitalContributor', {
  description: 'Участник кооператива в системе CAPITAL',
})
export class ContributorOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    description: 'ID в блокчейне',
  })
  id!: number;

  @Field(() => ContributorStatus, {
    description: 'Статус участника',
  })
  status!: ContributorStatus;

  @Field(() => String, {
    description: 'Хеш участника',
  })
  contributor_hash!: string;

  @Field(() => String, {
    description: 'Название кооператива',
  })
  coopname!: string;

  @Field(() => String, {
    description: 'Имя пользователя',
  })
  username!: string;

  @Field(() => String, {
    description: 'Статус из блокчейна',
  })
  blockchain_status!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Мемо/комментарий',
  })
  memo?: string;

  @Field(() => Boolean, {
    description: 'Является ли внешним контрактом',
  })
  is_external_contract!: boolean;

  @Field(() => String, {
    description: 'Ставка за час работы',
  })
  rate_per_hour!: string;

  @Field(() => Float, {
    description: 'Часов в день',
  })
  hours_per_day!: number;

  @Field(() => String, {
    nullable: true,
    description: 'О себе',
  })
  about?: string;

  @Field(() => String, {
    description: 'Сумма долга',
  })
  debt_amount!: string;

  @Field(() => String, {
    description: 'Вклад как инвестор',
  })
  contributed_as_investor!: string;

  @Field(() => String, {
    description: 'Вклад как исполнитель',
  })
  contributed_as_creator!: string;

  @Field(() => String, {
    description: 'Вклад как автор',
  })
  contributed_as_author!: string;

  @Field(() => String, {
    description: 'Вклад как координатор',
  })
  contributed_as_coordinator!: string;

  @Field(() => String, {
    description: 'Вклад как участник',
  })
  contributed_as_contributor!: string;

  @Field(() => String, {
    description: 'Вклад как собственник имущества',
  })
  contributed_as_propertor!: string;

  @Field(() => String, {
    description: 'Дата создания',
  })
  created_at!: string;

  @Field(() => DocumentAggregateDTO, {
    description: 'Контракт участника',
    nullable: true,
  })
  contract?: DocumentAggregateDTO | null;

  @Field(() => [String], {
    description: 'Приложения к контракту',
  })
  appendixes?: string[];

  @Field(() => String, {
    description: 'Отображаемое имя',
  })
  display_name!: string;
}
