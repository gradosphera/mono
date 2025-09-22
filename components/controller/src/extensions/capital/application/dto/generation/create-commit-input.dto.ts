import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import type { CreateCommitDomainInput } from '../../../domain/actions/create-commit-domain-input.interface';

/**
 * GraphQL DTO для создания коммита CAPITAL контракта
 * Пользователь указывает количество часов для коммита
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

  @Field(() => Number, { description: 'Количество часов для коммита' })
  @IsNumber({}, { message: 'Количество часов должно быть числом' })
  @Min(0.1, { message: 'Количество часов должно быть больше 0' })
  commit_hours!: number;

  @Field(() => String, { description: 'Описание коммита' })
  @IsNotEmpty({ message: 'Описание коммита не должно быть пустым' })
  @IsString({ message: 'Описание коммита должно быть строкой' })
  description!: string;

  @Field(() => String, { description: 'Мета-данные коммита' })
  @IsNotEmpty({ message: 'Мета-данные коммита не должны быть пустыми' })
  @IsString({ message: 'Мета-данные коммита должны быть строкой' })
  meta!: string;
}
