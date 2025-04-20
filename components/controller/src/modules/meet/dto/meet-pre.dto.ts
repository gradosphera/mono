import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AgendaMeetPointDTO } from './agenda-meet-point.dto';
import type { MeetPreProcessingDomainInterface } from '~/domain/meet/interfaces/meet-pre-domain.interface';
import { AnnualGeneralMeetingAgendaDocumentAggregateDTO } from '../../document/documents-dto/annual-general-meeting-agenda-document.dto';

@ObjectType('MeetPreProcessing')
export class MeetPreProcessingDTO implements MeetPreProcessingDomainInterface {
  @Field(() => String)
  coopname!: string;

  @Field(() => String)
  hash!: string;

  @Field(() => String)
  initiator!: string;

  @Field(() => String)
  presider!: string;

  @Field(() => String)
  secretary!: string;

  @Field(() => [AgendaMeetPointDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendaMeetPointDTO)
  agenda!: AgendaMeetPointDTO[];

  @Field(() => Date)
  open_at!: Date;

  @Field(() => Date)
  close_at!: Date;

  @Field(() => AnnualGeneralMeetingAgendaDocumentAggregateDTO, { nullable: true })
  @IsOptional()
  proposal?: AnnualGeneralMeetingAgendaDocumentAggregateDTO;

  constructor(data: MeetPreProcessingDTO) {
    Object.assign(this, data);
  }
}
