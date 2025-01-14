import { Field, InputType } from '@nestjs/graphql';
import type { DeleteBranchDomainInput } from '~/domain/branch/interfaces/delete-branch-domain-input';

@InputType('DeleteBranchInput')
export class DeleteBranchGraphQLInput implements DeleteBranchDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта кооперативного участка' })
  braname!: string;
}
