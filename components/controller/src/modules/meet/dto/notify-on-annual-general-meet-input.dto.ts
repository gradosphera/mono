import { Field, InputType } from '@nestjs/graphql';
import { IsHash, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NotifyOnAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/notify-on-annual-general-meet-input-domain.interface';
import { AnnualGeneralMeetingNotificationSignedDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-notification-document.dto';

@InputType('NotifyOnAnnualGeneralMeetInput')
export class NotifyOnAnnualGeneralMeetInputDTO implements NotifyOnAnnualGeneralMeetInputDomainInterface {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  coopname!: string;

  @Field(() => String)
  @IsHash('sha256')
  meet_hash!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  username!: string;

  @Field(() => AnnualGeneralMeetingNotificationSignedDocumentInputDTO)
  @ValidateNested()
  @Type(() => AnnualGeneralMeetingNotificationSignedDocumentInputDTO)
  notification!: AnnualGeneralMeetingNotificationSignedDocumentInputDTO;
}
