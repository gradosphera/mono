import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import type { GetOutgoingPaymentsInputDomainInterface } from '~/domain/gateway/interfaces/get-outgoing-payments-input-domain.interface';

/**
 * DTO для получения исходящих платежей
 */
@InputType('GetOutgoingPaymentsInput')
export class GetOutgoingPaymentsInputDTO implements GetOutgoingPaymentsInputDomainInterface {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  coopname?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  username?: string;

  @Field(() => String, { nullable: true })
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}
