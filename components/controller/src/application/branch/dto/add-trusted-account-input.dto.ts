import { Field, InputType } from '@nestjs/graphql';
import type { AddTrustedAccountDomainInterface } from '~/domain/branch/interfaces/add-trusted-account-domain-input.interface';

@InputType('AddTrustedAccountInput')
export class AddTrustedAccountGraphQLInput implements AddTrustedAccountDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта кооперативного участка' })
  braname!: string;

  @Field(() => String, {
    description:
      'Имя аккаунта доверонного лица, который уполномачивается председателем кооперативного участка на совершение действий',
  })
  trusted!: string;
}
