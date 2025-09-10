import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { FundProjectDomainInput } from '../../../domain/actions/fund-project-domain-input.interface';

/**
 * GraphQL DTO для финансирования проекта CAPITAL контракта
 */
@InputType('FundProjectInput')
export class FundProjectInputDTO implements FundProjectDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Хэш проекта' })
  @IsNotEmpty({ message: 'Хэш проекта не должен быть пустым' })
  @IsString({ message: 'Хэш проекта должен быть строкой' })
  project_hash!: string;

  @Field(() => String, { description: 'Сумма финансирования' })
  @IsNotEmpty({ message: 'Сумма финансирования не должна быть пустой' })
  @IsString({ message: 'Сумма финансирования должна быть строкой' })
  amount!: string;

  @Field(() => String, { description: 'Memo' })
  @IsNotEmpty({ message: 'Memo не должно быть пустым' })
  @IsString({ message: 'Memo должно быть строкой' })
  memo!: string;
}
