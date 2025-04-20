import { Field, InputType } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { CloseAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/close-annual-general-meet-input-domain.interface';

@InputType('CloseAnnualGeneralMeetInput')
export class CloseAnnualGeneralMeetInputDTO implements CloseAnnualGeneralMeetInputDomainInterface {
  @Field(() => String)
  @IsString()
  coopname!: string;

  @Field(() => String)
  @IsString()
  hash!: string;

  @Field(() => SignedDigitalDocumentInputDTO)
  @ValidateNested()
  @Type(() => SignedDigitalDocumentInputDTO)
  meet_decision!: SignedDigitalDocumentInputDTO;
}
