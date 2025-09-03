import { Field, InputType } from '@nestjs/graphql';
import { IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateWithdrawInputDomainInterface } from '~/domain/wallet/interfaces/create-withdraw-input-domain.interface';
import { ReturnByMoneySignedDocumentInputDTO } from '~/application/document/documents-dto/return-by-money-statement.dto';

/**
 * DTO для создания заявки на вывод средств
 */
@InputType('CreateWithdrawInput')
export class CreateWithdrawInputDTO implements CreateWithdrawInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя пользователя' })
  @IsString()
  username!: string;

  @Field(() => Number, { description: 'Количество средств' })
  @IsNumber()
  quantity!: number;

  @Field(() => String, { description: 'Символ валюты' })
  @IsString()
  symbol!: string;

  @Field(() => String, { description: 'ID метода платежа' })
  @IsString()
  method_id!: string;

  @Field(() => String, { description: 'Хеш платежа для связи с withdraw' })
  @IsString()
  payment_hash!: string;

  @Field(() => ReturnByMoneySignedDocumentInputDTO, { description: 'Подписанное заявление на возврат средств' })
  @ValidateNested()
  @Type(() => ReturnByMoneySignedDocumentInputDTO)
  statement!: ReturnByMoneySignedDocumentInputDTO;
}
