import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import type { SovietContract } from 'cooptypes';

@ObjectType('ParticipantAccount')
export class ParticipantAccountDTO {
  @Field(() => String, { description: 'Уникальное имя члена кооператива' })
  @IsString()
  public readonly username: string;

  @Field(() => GraphQLISODateTime, { description: 'Время создания записи о члене' })
  @Type(() => Date)
  public readonly created_at: Date;

  @Field(() => GraphQLISODateTime, { description: 'Время последнего обновления информации о члене' })
  @Type(() => Date)
  public readonly last_update: Date;

  @Field(() => GraphQLISODateTime, { description: 'Время последнего минимального платежа' })
  @Type(() => Date)
  public readonly last_min_pay: Date;

  @Field(() => String, { description: 'Статус члена кооператива (accepted | blocked)' })
  @IsString()
  public readonly status: string;

  @Field(() => Boolean, { description: 'LEGACY Флаг, внесен ли регистрационный взнос' })
  @IsBoolean()
  public readonly is_initial: boolean;

  @Field(() => Boolean, { description: 'LEGACY Флаг, внесен ли минимальный паевый взнос' })
  @IsBoolean()
  public readonly is_minimum: boolean;

  @Field(() => Boolean, { description: 'LEGACY Флаг, имеет ли член право голоса' })
  @IsBoolean()
  public readonly has_vote: boolean;

  @Field(() => String, { description: 'Тип участника (individual | entrepreneur | organization)', nullable: true })
  @IsString()
  @IsOptional()
  public readonly type?: string;

  @Field(() => String, { description: 'Имя кооперативного участка', nullable: true })
  @IsString()
  @IsOptional()
  public readonly braname?: string;

  @Field(() => String, { description: 'Сумма вступительного взноса', nullable: true })
  @IsString()
  @IsOptional()
  public readonly initial_amount: string;

  @Field(() => String, { description: 'Сумма минимального паевого взноса', nullable: true })
  @IsString()
  @IsOptional()
  public readonly minimum_amount: string;

  constructor(entity: SovietContract.Tables.Participants.IParticipants) {
    this.username = entity.username;
    this.created_at = new Date(entity.created_at);
    this.last_update = new Date(entity.last_update);
    this.last_min_pay = new Date(entity.last_min_pay);
    this.status = entity.status;
    this.is_initial = entity.is_initial;
    this.is_minimum = entity.is_minimum;
    this.has_vote = entity.has_vote;
    this.type = entity.type;
    this.braname = entity.braname;
    this.initial_amount = entity.initial_amount;
    this.minimum_amount = entity.minimum_amount;
  }
}
