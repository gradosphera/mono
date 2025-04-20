import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import type { PublishProjectFreeDecisionInputDomainInterface } from '~/domain/free-decision/interfaces/publish-project-free-decision.interface';
import { ProjectFreeDecisionSignedDocumentInputDTO } from '../../document/documents-dto/project-free-decision-document.dto';

@InputType('PublishProjectFreeDecisionInput')
export class PublishProjectFreeDecisionInputDTO implements PublishProjectFreeDecisionInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsNotEmpty({ message: 'Имя аккаунта пользователя не должно быть пустым' })
  username!: string;

  @Field(() => ProjectFreeDecisionSignedDocumentInputDTO, {
    description: 'Подписанный электронный документ (generateProjectOfFreeDecision)',
  })
  @ValidateNested()
  document!: ProjectFreeDecisionSignedDocumentInputDTO;

  @Field(() => String, {
    description: 'Строка мета-информации',
  })
  @IsString({ message: 'Мета-информация свободного решения должна быть строкой' })
  meta!: string;
}
