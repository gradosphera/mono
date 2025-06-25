import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { CreateWithdrawInputDomainInterface } from '~/domain/wallet/interfaces/create-withdraw-input-domain.interface';

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

  @Field(() => String, { description: 'Количество средств' })
  @IsString()
  quantity!: string;

  @Field(() => String, { description: 'Символ валюты' })
  @IsString()
  symbol!: string;

  @Field(() => String, { description: 'ID метода платежа' })
  @IsString()
  method_id!: string;

  @Field(() => String, { description: 'Дополнительная информация', nullable: true })
  @IsString()
  @IsOptional()
  memo?: string;

  @Field(() => SignedDigitalDocumentInputDTO, { description: 'Подписанное заявление на возврат средств' })
  @ValidateNested()
  @Type(() => SignedDigitalDocumentInputDTO)
  statement!: SignedDigitalDocumentInputDTO;
}
