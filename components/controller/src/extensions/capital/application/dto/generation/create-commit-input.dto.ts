import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { CreateCommitDomainInput } from '../../../domain/actions/create-commit-domain-input.interface';

/**
 * GraphQL DTO для создания коммита CAPITAL контракта
 * Время рассчитывается автоматически на основе записей time-tracking
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

  // Поле creator_hours удалено - время рассчитывается автоматически
}
