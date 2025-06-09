import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType('GeneralMeetBallotInput', { description: 'Входные данные для бюллетеня голосования' })
export class GeneralMeetBallotInputDTO {
  @Field(() => String, { description: 'Хеш собрания' })
  @IsString()
  @IsNotEmpty()
  meet_hash!: string;

  @Field(() => String, { description: 'Имя пользователя голосующего' })
  @IsString()
  @IsNotEmpty()
  username!: string;
}
