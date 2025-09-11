import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import type { RegisterContributorDomainInput } from '../../../domain/actions/register-contributor-domain-input.interface';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

/**
 * GraphQL DTO для регистрации вкладчика CAPITAL контракта
 */
@InputType('RegisterContributorInput')
export class RegisterContributorInputDTO implements RegisterContributorDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Имя пользователя' })
  @IsNotEmpty({ message: 'Имя пользователя не должно быть пустым' })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  username!: string;

  @Field(() => String, { description: 'Хэш вкладчика' })
  @IsNotEmpty({ message: 'Хэш вкладчика не должен быть пустым' })
  @IsString({ message: 'Хэш вкладчика должен быть строкой' })
  contributor_hash!: string;

  @Field(() => String, { description: 'Ставка за час работы' })
  @IsNotEmpty({ message: 'Ставка за час работы не должна быть пустой' })
  @IsString({ message: 'Ставка за час работы должна быть строкой' })
  rate_per_hour!: string;

  @Field(() => Boolean, { description: 'Флаг внешнего контракта' })
  @IsBoolean({ message: 'Флаг внешнего контракта должен быть булевым' })
  is_external_contract!: boolean;

  @Field(() => SignedDigitalDocumentInputDTO, { description: 'Документ контракта' })
  @Type(() => SignedDigitalDocumentInputDTO)
  contract!: SignedDigitalDocumentInputDTO;
}
