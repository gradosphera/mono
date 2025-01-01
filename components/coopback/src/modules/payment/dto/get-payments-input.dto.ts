import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import type { GetPaymentsInputDomainInterface } from '~/domain/payment/interfaces/get-payments-input-domain.interface';
import { PaymentStatus } from '~/domain/payment/interfaces/payment-status-domain.interface';

@InputType('GetPaymentsInput')
export class GetPaymentsInputDTO implements GetPaymentsInputDomainInterface {
  @Field(() => String, { nullable: true, description: 'Имя пользователя для фильтрации платежей' })
  @IsOptional()
  @IsString()
  username?: string;

  @Field(() => String, { nullable: true, description: 'Идентификатор платежа во внутренней системе' })
  @IsOptional()
  @IsString()
  id?: string;

  @Field(() => String, { nullable: true, description: 'Идентификатор платежа в блокчейне' })
  @IsOptional()
  @IsString()
  blockchain_id?: string;

  @Field(() => PaymentStatus, { nullable: true, description: 'Статус платежа' })
  @IsOptional()
  @IsString()
  status?: string;
}
