import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray } from 'class-validator';
import type { QuestionRowProcessingDomainInterface } from '~/domain/meet/interfaces/question-row-processing-domain.interface';

@ObjectType('Question')
export class QuestionDTO implements QuestionRowProcessingDomainInterface {
  @Field(() => Number)
  id!: number;

  @Field(() => Number)
  number!: number;

  @Field(() => String)
  coopname!: string;

  @Field(() => Number)
  meet_id!: number;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  context!: string;

  @Field(() => String)
  decision!: string;

  @Field(() => Number)
  counter_votes_for!: number;

  @Field(() => Number)
  counter_votes_against!: number;

  @Field(() => Number)
  counter_votes_abstained!: number;

  @Field(() => [String])
  @IsArray()
  voters_for!: string[];

  @Field(() => [String])
  @IsArray()
  voters_against!: string[];

  @Field(() => [String])
  @IsArray()
  voters_abstained!: string[];

  constructor(data: QuestionDTO) {
    Object.assign(this, data);
  }
}
