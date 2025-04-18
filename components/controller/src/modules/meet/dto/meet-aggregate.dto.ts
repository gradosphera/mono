import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { MeetPreProcessingDTO } from './meet-pre.dto';
import { MeetProcessingDTO } from './meet-processing.dto';
import { MeetProcessedDTO } from './meet-processed.dto';
import type { MeetDomainAggregate } from '~/domain/meet/interfaces/meet-aggregate.interface';

@ObjectType('MeetAggregate')
export class MeetAggregateDTO implements MeetDomainAggregate {
  @Field(() => String, { description: 'Идентификатор проекта свободного решения' })
  @IsNotEmpty()
  @IsString()
  hash!: string;

  @Field(() => MeetPreProcessingDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeetPreProcessingDTO)
  pre?: MeetPreProcessingDTO;

  @Field(() => MeetProcessingDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeetProcessingDTO)
  processing?: MeetProcessingDTO;

  @Field(() => MeetProcessedDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeetProcessedDTO)
  processed?: MeetProcessedDTO;

  constructor(data: MeetAggregateDTO) {
    Object.assign(this, data);
  }
}
