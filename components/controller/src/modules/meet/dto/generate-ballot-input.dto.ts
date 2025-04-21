import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';

@InputType('GenerateBallotForAnnualGeneralMeetInput', {
  description: 'Входные данные для генерации бюллетеня для голосования на общем собрании',
})
export class GenerateBallotForAnnualGeneralMeetInputDTO
  implements Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action
{
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя пользователя, для которого генерируется бюллетень' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Хеш собрания, для которого генерируется бюллетень' })
  @IsString()
  meet_hash!: string;

  registry_id!: number;
}
