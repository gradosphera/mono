import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import type { SearchPrivateAccountsInputDomainInterface } from '~/domain/common/interfaces/search-private-accounts-domain.interface';

@InputType('SearchPrivateAccountsInput')
export class SearchPrivateAccountsInputDTO implements SearchPrivateAccountsInputDomainInterface {
  @Field(() => String, { description: 'Поисковый запрос для поиска приватных аккаунтов' })
  @IsString({ message: 'Поисковый запрос должен быть строкой' })
  @IsNotEmpty({ message: 'Поисковый запрос не может быть пустым' })
  query!: string;
}
