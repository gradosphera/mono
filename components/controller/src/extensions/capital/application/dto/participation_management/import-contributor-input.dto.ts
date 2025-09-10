import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { ImportContributorDomainInput } from '../../../domain/actions/import-contributor-domain-input.interface';

/**
 * GraphQL DTO для импорта вкладчика в CAPITAL контракт
 */
@InputType('ImportContributorInput')
export class ImportContributorInputDTO implements ImportContributorDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsNotEmpty({ message: 'Имя аккаунта пользователя не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта пользователя должно быть строкой' })
  username!: string;

  @Field(() => String, { description: 'Хэш вкладчика' })
  @IsNotEmpty({ message: 'Хэш вкладчика не должен быть пустым' })
  @IsString({ message: 'Хэш вкладчика должен быть строкой' })
  contributor_hash!: string;

  @Field(() => String, { description: 'Сумма вклада' })
  @IsNotEmpty({ message: 'Сумма вклада не должна быть пустой' })
  @IsString({ message: 'Сумма вклада должна быть строкой' })
  contribution_amount!: string;

  @Field(() => String, { description: 'Примечание', nullable: true })
  @IsString({ message: 'Примечание должно быть строкой' })
  memo!: string;
}
