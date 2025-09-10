import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import type { CreateCommitDomainInput } from '../../../domain/actions/create-commit-domain-input.interface';

/**
 * GraphQL DTO для создания коммита CAPITAL контракта
 */
@InputType('CreateCommitInput')
export class CreateCommitInputDTO implements CreateCommitDomainInput {
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

  @Field(() => String, { description: 'Хэш коммита' })
  @IsNotEmpty({ message: 'Хэш коммита не должен быть пустым' })
  @IsString({ message: 'Хэш коммита должен быть строкой' })
  commit_hash!: string;

  @Field(() => Number, { description: 'Количество часов создателя' })
  @IsNumber({}, { message: 'Количество часов создателя должно быть числом' })
  @Min(0, { message: 'Количество часов создателя не может быть отрицательным' })
  creator_hours!: number;
}
