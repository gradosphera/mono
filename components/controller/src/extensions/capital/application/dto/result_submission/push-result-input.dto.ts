import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import type { PushResultDomainInput } from '~/extensions/capital/domain/actions/push-result-domain-input.interface';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

/**
 * GraphQL DTO для внесения результата CAPITAL контракта
 */
@InputType('PushResultInput')
export class PushResultInputDTO implements Omit<PushResultDomainInput, 'result_hash'> {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Имя пользователя' })
  @IsNotEmpty({ message: 'Имя пользователя не должно быть пустым' })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  username!: string;

  @Field(() => String, { description: 'Хэш проекта' })
  @IsNotEmpty({ message: 'Хэш проекта не должен быть пустым' })
  @IsString({ message: 'Хэш проекта должен быть строкой' })
  project_hash!: string;

  @Field(() => String, { description: 'Сумма взноса' })
  @IsNotEmpty({ message: 'Сумма взноса не должна быть пустой' })
  @IsString({ message: 'Сумма взноса должна быть строкой' })
  contribution_amount!: string;

  @Field(() => String, { description: 'Сумма долга к погашению' })
  @IsNotEmpty({ message: 'Сумма долга к погашению не должна быть пустой' })
  @IsString({ message: 'Сумма долга к погашению должна быть строкой' })
  debt_amount!: string;

  @Field(() => SignedDigitalDocumentInputDTO, { description: 'Заявление' })
  @Type(() => SignedDigitalDocumentInputDTO)
  statement!: SignedDigitalDocumentInputDTO;

  @Field(() => [String], { description: 'Хэши долгов для погашения' })
  @IsArray({ message: 'Хэши долгов должны быть массивом' })
  debt_hashes!: string[];
}
