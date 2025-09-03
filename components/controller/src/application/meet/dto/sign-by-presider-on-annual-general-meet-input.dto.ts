import { Field, InputType } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SignByPresiderOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/sign-by-presider-on-annual-general-meet-input-domain.interface';
import { AnnualGeneralMeetingDecisionSignedDocumentInputDTO } from '~/application/document/documents-dto/annual-general-meeting-decision-document.dto';

@InputType('SignByPresiderOnAnnualGeneralMeetInput', { description: 'Входные данные для подписи решения председателем' })
export class SignByPresiderOnAnnualGeneralMeetInputDTO implements SignByPresiderOnAnnualGeneralMeetInputDomainInterface {
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
    description: 'Подписанный документ с решением председателя',
  })
  @ValidateNested()
  @Type(() => AnnualGeneralMeetingDecisionSignedDocumentInputDTO)
  presider_decision!: AnnualGeneralMeetingDecisionSignedDocumentInputDTO;
}
