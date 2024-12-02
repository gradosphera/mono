import { Field, InputType } from '@nestjs/graphql';
import type { EnableBranchedModeDomainInput } from '~/domain/branch/interfaces/enable-branched-mode-input.interface';

@InputType('EnableBranchedModeInput')
export class EnableBranchedModeInputDTO implements EnableBranchedModeDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;
}
