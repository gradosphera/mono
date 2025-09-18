import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { BaseOutputDTO } from '../base.dto';

/**
 * GraphQL Output DTO для сущности ProjectWallet
 */
@ObjectType('CapitalProjectWallet', {
  description: 'Проектный кошелек в системе CAPITAL',
})
export class ProjectWalletOutputDTO extends BaseOutputDTO {
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

  @Field(() => String, {
    description: 'Имя пользователя',
  })
  username!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Название кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Хеш проекта',
  })
  project_hash?: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Количество акций',
  })
  shares?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Последняя награда за акцию членства',
  })
  last_membership_reward_per_share?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Доступное членство',
  })
  membership_available?: number;
}
