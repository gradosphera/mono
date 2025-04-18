import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MeetDTO } from './meet.dto';
import { QuestionDTO } from './question.dto';

@ObjectType('MeetProcessing')
export class MeetProcessingDTO {
  @Field(() => String)
  hash!: string;

  @Field(() => MeetDTO)
  @ValidateNested()
  @Type(() => MeetDTO)
  meet!: MeetDTO;

  @Field(() => [QuestionDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questions!: QuestionDTO[];

  constructor(data: MeetProcessingDTO) {
    Object.assign(this, data);
  }
}
