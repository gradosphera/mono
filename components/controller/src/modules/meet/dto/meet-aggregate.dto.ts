import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { MeetPreProcessingDTO } from './meet-pre.dto';
import { MeetProcessingDTO } from './meet-processing.dto';
import { MeetProcessedDTO } from './meet-processed.dto';
import type { MeetDomainAggregate } from '~/domain/meet/interfaces/meet-aggregate.interface';

@ObjectType('MeetAggregate', { description: 'Агрегат данных о собрании, содержащий информацию о разных этапах' })
export class MeetAggregateDTO implements MeetDomainAggregate {
  @Field(() => String, { description: 'Хеш собрания' })
  @IsNotEmpty()
  @IsString()
  hash!: string;

  @Field(() => MeetPreProcessingDTO, { nullable: true, description: 'Данные собрания на этапе предварительной обработки' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeetPreProcessingDTO)
  pre?: MeetPreProcessingDTO | null;

  @Field(() => MeetProcessingDTO, { nullable: true, description: 'Данные собрания на этапе обработки' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeetProcessingDTO)
  processing?: MeetProcessingDTO | null;

  @Field(() => MeetProcessedDTO, { nullable: true, description: 'Данные собрания после обработки' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeetProcessedDTO)
  processed?: MeetProcessedDTO | null;

  constructor(data: MeetAggregateDTO) {
    Object.assign(this, data);
  }
}
