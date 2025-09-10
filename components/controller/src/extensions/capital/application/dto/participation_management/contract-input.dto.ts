import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractDocumentInputDTO } from './contract-document-input.dto';

/**
 * DTO для контракта
 */
@InputType('ContractInput')
export class ContractInputDTO {
  @Field(() => String, { description: 'Заголовок контракта' })
  @IsString({ message: 'Заголовок контракта должен быть строкой' })
  title!: string;

  @Field(() => String, { description: 'Содержимое контракта' })
  @IsString({ message: 'Содержимое контракта должно быть строкой' })
  content!: string;

  @Field(() => String, { description: 'Хэш контракта' })
  @IsString({ message: 'Хэш контракта должен быть строкой' })
  hash!: string;

  @Field(() => [ContractDocumentInputDTO], { description: 'Подписи контракта' })
  @Type(() => ContractDocumentInputDTO)
  signatures!: ContractDocumentInputDTO[];
}
