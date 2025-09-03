import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import { PaymentTypeEnum, PaymentDirectionEnum } from '~/domain/gateway/enums/payment-type.enum';
import type { PaymentDomainInterface } from '~/domain/gateway/interfaces/payment-domain.interface';
import { PaymentDetailsDTO } from './payment-details.dto';
import { UserCertificateUnion } from '~/application/document/unions/user-certificate.union';
import { IndividualCertificateDTO } from '~/application/common/dto/individual-certificate.dto';
import { EntrepreneurCertificateDTO } from '~/application/common/dto/entrepreneur-certificate.dto';
import { OrganizationCertificateDTO } from '~/application/common/dto/organization-certificate.dto';

// Регистрируем enum'ы для GraphQL (основная регистрация)
registerEnumType(PaymentStatusEnum, {
  name: 'PaymentStatus',
  description: 'Статус платежа',
});

registerEnumType(PaymentTypeEnum, {
  name: 'PaymentType',
  description: 'Тип платежа по назначению',
});

registerEnumType(PaymentDirectionEnum, {
  name: 'PaymentDirection',
  description: 'Направление платежа',
});

/**
 * Унифицированное DTO платежа для GraphQL
 * Работает как для входящих, так и для исходящих платежей
 */
@ObjectType('GatewayPayment')
export class GatewayPaymentDTO implements PaymentDomainInterface {
  @Field(() => ID, { nullable: true, description: 'Уникальный идентификатор платежа' })
  id?: string;

  @Field(() => String, { nullable: true, description: 'Хеш платежа' })
  hash!: string;

  @Field(() => String, { description: 'Название кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Имя пользователя' })
  username!: string;

  @Field(() => UserCertificateUnion, {
    nullable: true,
    description: 'Сертификат пользователя, создавшего платеж',
  })
  username_certificate?: IndividualCertificateDTO | EntrepreneurCertificateDTO | OrganizationCertificateDTO | null;

  @Field(() => Number, { description: 'Количество/сумма' })
  quantity!: number;

  @Field(() => String, { description: 'Символ валюты' })
  symbol!: string;

  @Field(() => PaymentTypeEnum, { description: 'Тип платежа' })
  type!: PaymentTypeEnum;

  @Field(() => PaymentDirectionEnum, { description: 'Направление платежа' })
  direction!: PaymentDirectionEnum;

  @Field(() => PaymentStatusEnum, { description: 'Статус платежа' })
  status!: PaymentStatusEnum;

  @Field(() => String, { nullable: true, description: 'Провайдер платежа' })
  provider?: string;

  @Field(() => String, { nullable: true, description: 'ID платежного метода' })
  payment_method_id?: string;

  @Field(() => String, { nullable: true, description: 'Сообщение' })
  message?: string;

  @Field(() => String, { nullable: true, description: 'Дополнительная информация' })
  memo?: string;

  @Field(() => Date, { nullable: true, description: 'Дата истечения' })
  expired_at?: Date;

  @Field(() => Date, { description: 'Дата создания' })
  created_at!: Date;

  @Field(() => Date, { nullable: true, description: 'Дата обновления' })
  updated_at?: Date;

  @Field(() => PaymentDetailsDTO, { nullable: true, description: 'Детали платежа' })
  payment_details?: PaymentDetailsDTO;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Данные из блокчейна' })
  blockchain_data?: any;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Подписанный документ заявления' })
  statement?: any;

  // Поля для обратной совместимости
  @Field(() => String, { nullable: true, description: 'Хеш исходящего платежа (устарело)' })
  outcome_hash?: string;

  @Field(() => String, { nullable: true, description: 'Хеш входящего платежа (устарело)' })
  income_hash?: string;

  // Вычисляемые поля
  @Field(() => String, { description: 'Форматированная сумма' })
  formatted_amount!: string;

  @Field(() => String, { description: 'Человекочитаемый статус' })
  status_label!: string;

  @Field(() => String, { description: 'Человекочитаемый тип платежа' })
  type_label!: string;

  @Field(() => String, { description: 'Человекочитаемое направление платежа' })
  direction_label!: string;

  @Field(() => Boolean, { description: 'Можно ли изменить статус' })
  can_change_status!: boolean;

  @Field(() => Boolean, { description: 'Завершен ли платеж окончательно' })
  is_final!: boolean;
}
