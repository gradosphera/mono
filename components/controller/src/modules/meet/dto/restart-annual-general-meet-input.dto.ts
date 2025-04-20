import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnualGeneralMeetingAgendaSignedDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-agenda-document.dto';
import { RestartAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/restart-annual-general-meet-input-domain.interface';

@InputType('RestartAnnualGeneralMeetInput')
export class RestartAnnualGeneralMeetInputDTO implements RestartAnnualGeneralMeetInputDomainInterface {
  @Field(() => String)
  @IsString()
  coopname!: string;

  @Field(() => String)
  @IsString()
  hash!: string;

  @Field(() => AnnualGeneralMeetingAgendaSignedDocumentInputDTO)
  @ValidateNested()
  newproposal!: AnnualGeneralMeetingAgendaSignedDocumentInputDTO;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  new_open_at!: Date;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  new_close_at!: Date;
}
