import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';

@InputType('GenerateSovietDecisionOnAnnualMeetInput')
export class GenerateSovietDecisionOnAnnualMeetInputDTO
  implements Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Action
{
  @Field(() => String, {
    description: 'Название кооператива',
  })
  @IsString()
  coopname!: string;

  @Field(() => String, {
    description: 'Хэш собрания, для которого генерируется решение совета',
  })
  @IsString()
  meet_hash!: string;

  @Field(() => String, {
    description: 'Имя пользователя, создающего документ',
  })
  @IsString()
  username!: string;

  registry_id!: number;

  /**
   * Преобразует DTO в доменный объект
   */
  toDomain(): Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Action {
    return {
      coopname: this.coopname,
      meet_hash: this.meet_hash,
      username: this.username,
      registry_id: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id,
    };
  }
}
