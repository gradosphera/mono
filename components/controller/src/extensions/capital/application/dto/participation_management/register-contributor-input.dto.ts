import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @Field(() => String, { description: 'О себе', nullable: true })
  @IsOptional()
  @IsString({ message: 'О себе должно быть строкой' })
  about?: string;

  @Field(() => String, { description: 'Ставка за час работы' })
  @IsOptional()
  @IsString({ message: 'Ставка за час работы должна быть строкой' })
  rate_per_hour?: string;

  @Field(() => SignedDigitalDocumentInputDTO, { description: 'Документ контракта' })
  @Type(() => SignedDigitalDocumentInputDTO)
  contract!: SignedDigitalDocumentInputDTO;
}
