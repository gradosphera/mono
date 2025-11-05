import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { SovietMemberInputDTO } from './soviet-member-input.dto';
import { SetVarsInputDTO } from './set-vars-input.dto';

@InputType('Install')
export class InstallDTO {
  @Field(() => [SovietMemberInputDTO])
  @ValidateNested()
  soviet!: SovietMemberInputDTO[];

  @Field(() => SetVarsInputDTO)
  @ValidateNested()
  vars!: SetVarsInputDTO;
}
