import { Field, ObjectType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import type { MeetRowProcessingDomainInterface } from '~/domain/meet/interfaces/meet-row-processing-domain.interface';
import { AnnualGeneralMeetingAgendaDocumentAggregateDTO } from '../../document/documents-dto/annual-general-meeting-agenda-document.dto';
import { AnnualGeneralMeetingSovietDecisionDocumentAggregateDTO } from '../../document/documents-dto/annual-general-meeting-soviet-decision-document.dto';

@ObjectType('Meet')
export class MeetDTO implements MeetRowProcessingDomainInterface {
  @Field(() => Number)
  id!: number;

  @Field(() => String)
  hash!: string;

  @Field(() => String)
  coopname!: string;

  @Field(() => String)
  type!: string;

  @Field(() => String)
  initiator!: string;

  @Field(() => String)
  presider!: string;

  @Field(() => String)
  secretary!: string;

  @Field(() => String)
  status!: string;

  @Field(() => Date)
  created_at!: Date;

  @Field(() => Date)
  open_at!: Date;

  @Field(() => Date)
  close_at!: Date;

  @Field(() => Number)
  quorum_percent!: number;

  @Field(() => Number)
  signed_ballots!: number;

  @Field(() => Number)
  current_quorum_percent!: number;

  @Field(() => Number)
  cycle!: number;

  @Field(() => Boolean)
  quorum_passed!: boolean;

  @Field(() => AnnualGeneralMeetingAgendaDocumentAggregateDTO)
  @ValidateNested()
  proposal!: AnnualGeneralMeetingAgendaDocumentAggregateDTO;

  @Field(() => AnnualGeneralMeetingSovietDecisionDocumentAggregateDTO)
  @ValidateNested()
  authorization!: AnnualGeneralMeetingSovietDecisionDocumentAggregateDTO;

  constructor(data: MeetDTO) {
    Object.assign(this, data);
  }
}
