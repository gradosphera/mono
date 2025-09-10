import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import type { PushResultDomainInput } from '~/extensions/capital/domain/actions/push-result-domain-input.interface';
import { ContractInputDTO } from '../participation_management/contract-input.dto';

/**
 * GraphQL DTO для внесения результата CAPITAL контракта
 */
@InputType('PushResultInput')
export class PushResultInputDTO implements PushResultDomainInput {
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

  @Field(() => String, { description: 'Хэш результата' })
  @IsNotEmpty({ message: 'Хэш результата не должен быть пустым' })
  @IsString({ message: 'Хэш результата должен быть строкой' })
  result_hash!: string;

  @Field(() => String, { description: 'Сумма взноса' })
  @IsNotEmpty({ message: 'Сумма взноса не должна быть пустой' })
  @IsString({ message: 'Сумма взноса должна быть строкой' })
  contribution_amount!: string;

  @Field(() => String, { description: 'Сумма долга к погашению' })
  @IsNotEmpty({ message: 'Сумма долга к погашению не должна быть пустой' })
  @IsString({ message: 'Сумма долга к погашению должна быть строкой' })
  debt_amount!: string;

  @Field(() => ContractInputDTO, { description: 'Заявление' })
  @Type(() => ContractInputDTO)
  statement!: ContractInputDTO;

  @Field(() => [String], { description: 'Хэши долгов для погашения' })
  @IsArray({ message: 'Хэши долгов должны быть массивом' })
  debt_hashes!: string[];
}
