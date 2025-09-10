import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { RefreshProjectDomainInput } from '../../../domain/actions/refresh-project-domain-input.interface';

/**
 * GraphQL DTO для обновления CRPS пайщика в проекте CAPITAL контракта
 */
@InputType('RefreshProjectInput')
export class RefreshProjectInputDTO implements RefreshProjectDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Хэш проекта' })
  @IsNotEmpty({ message: 'Хэш проекта не должен быть пустым' })
  @IsString({ message: 'Хэш проекта должен быть строкой' })
  project_hash!: string;

  @Field(() => String, { description: 'Имя пользователя' })
  @IsNotEmpty({ message: 'Имя пользователя не должно быть пустым' })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  username!: string;
}
