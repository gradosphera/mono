import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { SovietMemberInputDTO } from './soviet-member-input.dto';

@InputType('Install')
export class InstallDTO {
  @Field(() => [SovietMemberInputDTO])
  @ValidateNested()
  soviet!: SovietMemberInputDTO[];

  @Field(() => String)
  wif!: string;
}
