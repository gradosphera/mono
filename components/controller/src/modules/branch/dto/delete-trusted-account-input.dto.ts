import { Field, InputType } from '@nestjs/graphql';
import type { DeleteTrustedAccountDomainInterface } from '~/domain/branch/interfaces/delete-trusted-account-domain-input.interface';

@InputType('DeleteTrustedAccountInput')
export class DeleteTrustedAccountGraphQLInput implements DeleteTrustedAccountDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта кооперативного участка' })
  braname!: string;

  @Field(() => String, {
    description: 'Имя аккаунта доверонного лица, у которого отзывается право подписи за председателя кооперативного участка',
  })
  trusted!: string;
}
