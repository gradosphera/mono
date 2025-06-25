import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { GatewayPaymentStatusEnum } from '~/domain/gateway/enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '~/domain/gateway/enums/gateway-payment-type.enum';

// Регистрируем enum'ы для GraphQL
registerEnumType(GatewayPaymentStatusEnum, {
  name: 'gatewayPaymentStatus',
  description: 'Статус платежа в системе Gateway',
});

registerEnumType(GatewayPaymentTypeEnum, {
  name: 'gatewayPaymentType',
  description: 'Тип платежа в системе Gateway',
});

/**
 * Универсальное DTO платежа для GraphQL
 * Работает как для входящих, так и для исходящих платежей
 */
@ObjectType('GatewayPayment')
export class GatewayPaymentDTO {
  @Field(() => ID, { nullable: true, description: 'Уникальный идентификатор платежа' })
  id?: string;

  @Field({ description: 'Название кооператива' })
  coopname!: string;

  @Field({ description: 'Имя пользователя' })
  username!: string;

  @Field({ description: 'Универсальный хеш платежа' })
  hash!: string;

  @Field({ description: 'Хеш исходящего платежа', nullable: true })
  outcome_hash?: string;

  @Field({ description: 'Хеш входящего платежа', nullable: true })
  income_hash?: string;

  @Field({ description: 'Количество' })
  quantity!: string;

  @Field({ description: 'Символ валюты' })
  symbol!: string;

  @Field({ description: 'ID платежного метода' })
  method_id!: string;

  @Field(() => GatewayPaymentStatusEnum, { description: 'Статус платежа' })
  status!: GatewayPaymentStatusEnum;

  @Field(() => GatewayPaymentTypeEnum, { description: 'Тип платежа: входящий или исходящий' })
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

  @Field({ description: 'Человекочитаемый тип платежа' })
  type_label!: string;

  @Field({ description: 'Может ли статус быть изменен' })
  can_change_status!: boolean;
}
