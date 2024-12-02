import { Field, InputType } from '@nestjs/graphql';
import type { DisableBranchedModeDomainInput } from '~/domain/branch/interfaces/disable-branched-mode-input.interface';

@InputType('DisableBranchedModeInput')
export class DisableBranchedModeInputDTO implements DisableBranchedModeDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;
}
