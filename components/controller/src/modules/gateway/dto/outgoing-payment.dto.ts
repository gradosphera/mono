import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { GatewayPaymentStatusEnum } from '~/domain/gateway/enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '~/domain/gateway/enums/gateway-payment-type.enum';

/**
 * DTO исходящего платежа для GraphQL
 */
@ObjectType('OutgoingPayment')
export class OutgoingGatewayPaymentDTO {
  @Field(() => ID, { nullable: true, description: 'Уникальный идентификатор платежа' })
  id?: string;

  @Field({ description: 'Название кооператива' })
  coopname!: string;

  @Field({ description: 'Имя пользователя' })
  username!: string;

  @Field({ description: 'Хеш исходящего платежа' })
  hash!: string;

  @Field({ description: 'Количество' })
  quantity!: string;

  @Field({ description: 'Символ валюты' })
  symbol!: string;

  @Field({ description: 'ID платежного метода' })
  method_id!: string;

  @Field(() => GatewayPaymentStatusEnum, { description: 'Статус платежа' })
  status!: GatewayPaymentStatusEnum;

  @Field(() => GatewayPaymentTypeEnum, { description: 'Тип платежа (всегда outgoing)' })
  type!: GatewayPaymentTypeEnum;

  @Field({ description: 'Дата создания' })
  created_at!: Date;

  @Field({ description: 'Дата последнего обновления', nullable: true })
  updated_at?: Date;

  @Field({ description: 'Дополнительная информация', nullable: true })
  memo?: string;

  @Field({ description: 'Детали платежа', nullable: true })
  payment_details?: string;

  @Field(() => GraphQLJSON, { description: 'Данные из блокчейна', nullable: true })
  blockchain_data?: any;

  // Вычисляемые поля
  @Field({ description: 'Форматированная сумма' })
  formatted_amount!: string;

  @Field({ description: 'Человекочитаемый статус' })
  status_label!: string;

  @Field({ description: 'Может ли статус быть изменен' })
  can_change_status!: boolean;
}
