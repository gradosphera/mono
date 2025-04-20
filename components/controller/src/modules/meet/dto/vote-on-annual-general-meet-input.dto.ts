import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  VoteOnAnnualGeneralMeetInputDomainInterface,
  VoteItemInputDomainInterface,
} from '~/domain/meet/interfaces/vote-on-annual-general-meet-input.interface';

@InputType('VoteItemInput', { description: 'Пункт голосования для ежегодного общего собрания' })
export class VoteItemInputDTO implements VoteItemInputDomainInterface {
  @Field(() => String, { description: 'Идентификатор вопроса повестки' })
  @IsString()
  question_id!: string;

  @Field(() => String, { description: 'Решение по вопросу (вариант голосования)' })
  @IsString()
  vote!: string;
}

@InputType('VoteOnAnnualGeneralMeetInput', { description: 'Входные данные для голосования на ежегодном общем собрании' })
export class VoteOnAnnualGeneralMeetInputDTO implements VoteOnAnnualGeneralMeetInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хеш собрания, по которому производится голосование' })
  @IsString()
  hash!: string;

  @Field(() => String, { description: 'Идентификатор члена кооператива, который голосует' })
  @IsString()
  member!: string;

  @Field(() => [VoteItemInputDTO], { description: 'Бюллетень с решениями по вопросам повестки' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoteItemInputDTO)
  ballot!: VoteItemInputDTO[];
}
