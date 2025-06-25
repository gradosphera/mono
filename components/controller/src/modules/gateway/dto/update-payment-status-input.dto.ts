import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { GatewayPaymentStatusEnum } from '~/domain/gateway/enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '~/domain/gateway/enums/gateway-payment-type.enum';
import type { UpdatePaymentStatusInputDomainInterface } from '~/domain/gateway/interfaces/update-payment-status-input-domain.interface';

/**
 * DTO для обновления статуса платежа
 */
@InputType('UpdatePaymentStatusInput')
export class UpdatePaymentStatusInputDTO implements UpdatePaymentStatusInputDomainInterface {
  @Field({ description: 'Универсальный хеш платежа' })
  @IsString()
  @IsNotEmpty()
  hash!: string;

  @Field({ description: 'Название кооператива' })
  @IsString()
  @IsNotEmpty()
  coopname!: string;

  @Field({ description: 'Тип платежа' })
  @IsEnum(GatewayPaymentTypeEnum)
  type!: GatewayPaymentTypeEnum;

  @Field({ description: 'Новый статус платежа' })
  @IsEnum(GatewayPaymentStatusEnum)
  status!: GatewayPaymentStatusEnum;

  @Field({ description: 'Причина изменения статуса (для статуса failed)', nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;
}
