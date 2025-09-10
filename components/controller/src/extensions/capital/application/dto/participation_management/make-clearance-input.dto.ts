import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import type { MakeClearanceDomainInput } from '../../../domain/actions/make-clearance-domain-input.interface';
import { ContractInputDTO } from './contract-input.dto';

/**
 * GraphQL DTO для подписания приложения CAPITAL контракта
 */
@InputType('MakeClearanceInput')
export class MakeClearanceInputDTO implements MakeClearanceDomainInput {
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

  @Field(() => String, { description: 'Хэш приложения' })
  @IsNotEmpty({ message: 'Хэш приложения не должен быть пустым' })
  @IsString({ message: 'Хэш приложения должен быть строкой' })
  appendix_hash!: string;

  @Field(() => ContractInputDTO, { description: 'Документ' })
  @Type(() => ContractInputDTO)
  document!: ContractInputDTO;
}
