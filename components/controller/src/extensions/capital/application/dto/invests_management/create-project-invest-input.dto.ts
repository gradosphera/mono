import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { CreateProjectInvestDomainInput } from '~/extensions/capital/domain/actions/create-project-invest-domain-input.interface';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';
import { Type } from 'class-transformer';

/**
 * GraphQL DTO для инвестирования в проект CAPITAL контракта
 */
@InputType('CreateProjectInvestInput')
export class CreateProjectInvestInputDTO implements CreateProjectInvestDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Хэш проекта' })
  @IsNotEmpty({ message: 'Хэш проекта не должен быть пустым' })
  @IsString({ message: 'Хэш проекта должен быть строкой' })
  project_hash!: string;

  @Field(() => String, { description: 'Имя инвестора' })
  @IsNotEmpty({ message: 'Имя инвестора не должно быть пустым' })
  @IsString({ message: 'Имя инвестора должно быть строкой' })
  username!: string;

  @Field(() => String, { description: 'Хэш инвестиции' })
  @IsNotEmpty({ message: 'Хэш инвестиции не должен быть пустым' })
  @IsString({ message: 'Хэш инвестиции должен быть строкой' })
  invest_hash!: string;

  @Field(() => String, { description: 'Сумма инвестиции' })
  @IsNotEmpty({ message: 'Сумма инвестиции не должна быть пустой' })
  @IsString({ message: 'Сумма инвестиции должна быть строкой' })
  amount!: string;

  @Field(() => SignedDigitalDocumentInputDTO, { description: 'Заявление на инвестирование' })
  @Type(() => SignedDigitalDocumentInputDTO)
  statement!: SignedDigitalDocumentInputDTO;
}
