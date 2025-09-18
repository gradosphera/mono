import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ContributorStatus } from '../../../domain/enums/contributor-status.enum';
import { DocumentAggregateDTO } from '~/application/document/dto/document-aggregate.dto';
import { BaseOutputDTO } from '../base.dto';

/**
 * GraphQL Output DTO для сущности Contributor
 */
@ObjectType('CapitalContributor', {
  description: 'Вкладчик кооператива в системе CAPITAL',
})
export class ContributorOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Номер блока последнего обновления',
  })
  block_num?: number;

  @Field(() => Boolean, {
    description: 'Существует ли запись в блокчейне',
    defaultValue: false,
  })
  present!: boolean;

  @Field(() => ContributorStatus, {
    description: 'Статус вкладчика',
  })
  status!: ContributorStatus;

  @Field(() => String, {
    description: 'Хеш вкладчика',
  })
  contributor_hash!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Название кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя',
  })
  username?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Статус из блокчейна',
  })
  blockchain_status?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Мемо/комментарий',
  })
  memo?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Является ли внешним контрактом',
  })
  is_external_contract?: boolean;

  @Field(() => Float, {
    nullable: true,
    description: 'Ставка за час работы',
  })
  rate_per_hour?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Сумма долга',
  })
  debt_amount?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Вклад как инвестор',
  })
  contributed_as_investor?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Вклад как создатель',
  })
  contributed_as_creator?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Вклад как автор',
  })
  contributed_as_author?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Вклад как координатор',
  })
  contributed_as_coordinator?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Вклад как вкладчик',
  })
  contributed_as_contributor?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Вклад как собственник имущества',
  })
  contributed_as_propertor?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Дата создания',
  })
  created_at?: string;

  @Field(() => DocumentAggregateDTO, {
    nullable: true,
    description: 'Контракт вкладчика',
  })
  contract?: DocumentAggregateDTO;

  @Field(() => [String], {
    nullable: true,
    description: 'Приложения к контракту',
  })
  appendixes?: string[];
}
