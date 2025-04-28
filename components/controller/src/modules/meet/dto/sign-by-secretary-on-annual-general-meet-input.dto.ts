import { Field, InputType } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnualGeneralMeetingDecisionSignedDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-decision-document.dto';
import { SignBySecretaryOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/sign-by-secretary-on-annual-general-meet-input-domain.interface';

@InputType('SignBySecretaryOnAnnualGeneralMeetInput', { description: 'Входные данные для подписи решения секретарём' })
export class SignBySecretaryOnAnnualGeneralMeetInputDTO implements SignBySecretaryOnAnnualGeneralMeetInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Хеш собрания' })
  @IsString()
  hash!: string;

  @Field(() => AnnualGeneralMeetingDecisionSignedDocumentInputDTO, {
    description: 'Подписанный документ с решением секретаря',
  })
  @ValidateNested()
  @Type(() => AnnualGeneralMeetingDecisionSignedDocumentInputDTO)
  secretary_decision!: AnnualGeneralMeetingDecisionSignedDocumentInputDTO;
}
