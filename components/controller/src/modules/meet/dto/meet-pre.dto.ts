import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AgendaMeetPointDTO } from './agenda-meet-point-input.dto';
import type { MeetPreProcessingDomainInterface } from '~/domain/meet/interfaces/meet-pre-domain.interface';

@ObjectType('MeetPreProcessing')
export class MeetPreProcessingDTO implements MeetPreProcessingDomainInterface {
  @Field(() => String)
  coopname!: string;

  @Field(() => String)
  type!: string;

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

  @Field(() => Date)
  created_at!: Date;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  proposal?: object; //TODO: replace

  constructor(data: MeetPreProcessingDTO) {
    Object.assign(this, data);
  }
}
