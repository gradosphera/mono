import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  VoteOnAnnualGeneralMeetInputDomainInterface,
  VoteItemInputDomainInterface,
} from '~/domain/meet/interfaces/vote-on-annual-general-meet-input.interface';

@InputType('VoteItemInput')
export class VoteItemInputDTO implements VoteItemInputDomainInterface {
  @Field(() => String)
  @IsString()
  question_id!: string;

  @Field(() => String)
  @IsString()
  vote!: string;
}

@InputType('VoteOnAnnualGeneralMeetInput')
export class VoteOnAnnualGeneralMeetInputDTO implements VoteOnAnnualGeneralMeetInputDomainInterface {
  @Field(() => String)
  @IsString()
  coopname!: string;

  @Field(() => String)
  @IsString()
  hash!: string;

  @Field(() => String)
  @IsString()
  member!: string;

  @Field(() => [VoteItemInputDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoteItemInputDTO)
  ballot!: VoteItemInputDTO[];
}
