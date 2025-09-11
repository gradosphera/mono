import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ResultStatus } from '../../../domain/enums/result-status.enum';
import { DocumentAggregateDTO } from '~/application/document/dto/document-aggregate.dto';

/**
 * GraphQL Output DTO для сущности Result
 */
@ObjectType('CapitalResult', {
  description: 'Результат в системе CAPITAL',
})
export class ResultOutputDTO {
  @Field(() => String, {
    description: 'Внутренний ID базы данных',
  })
  _id!: string;

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

  @Field(() => ResultStatus, {
    description: 'Статус результата',
  })
  status!: ResultStatus;

  @Field(() => String, {
    description: 'Хеш результата',
  })
  result_hash!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Хеш проекта',
  })
  project_hash?: string;

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
    description: 'Дата создания',
  })
  created_at?: string;

  @Field(() => Float, {
    nullable: true,
    description: 'Сумма долга',
  })
  debt_amount?: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Общая сумма',
  })
  total_amount?: number;

  @Field(() => DocumentAggregateDTO, {
    nullable: true,
    description: 'Заявление на внесение результата интеллектуальной деятельности',
  })
  statement?: DocumentAggregateDTO;

  @Field(() => DocumentAggregateDTO, {
    nullable: true,
    description: 'Авторизация результата',
  })
  authorization?: DocumentAggregateDTO;

  @Field(() => DocumentAggregateDTO, {
    nullable: true,
    description: 'Акт приёма-передачи результата',
  })
  act?: DocumentAggregateDTO;
}
