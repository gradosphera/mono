import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

/**
 * DTO для документа контракта
 */
@InputType('ContractDocumentInput')
export class ContractDocumentInputDTO {
  @Field(() => String, { description: 'Подписывающий' })
  @IsString({ message: 'Подписывающий должен быть строкой' })
  signer!: string;

  @Field(() => String, { description: 'Тип подписи' })
  @IsString({ message: 'Тип подписи должен быть строкой' })
  type!: string;

  @Field(() => String, { description: 'Хэш подписи' })
  @IsString({ message: 'Хэш подписи должен быть строкой' })
  hash!: string;

  @Field(() => String, { description: 'Время подписи' })
  @IsString({ message: 'Время подписи должно быть строкой' })
  signed_at!: string;
}
