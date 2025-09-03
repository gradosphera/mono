import { ObjectType, Field } from '@nestjs/graphql';
import { AccountDTO } from './account.dto';
import { TokensDTO } from './tokens.dto';
import { ValidateNested } from 'class-validator';
import type { RegisteredAccountDomainInterface } from '~/domain/account/interfaces/registeted-account.interface';

@ObjectType('RegisteredAccount')
export class RegisteredAccountDTO {
  @Field(() => AccountDTO, { description: 'Информация об зарегистрированном аккаунте' })
  @ValidateNested()
  account!: AccountDTO;

  @Field(() => TokensDTO, { description: 'Токены доступа и обновления' })
  @ValidateNested()
  tokens!: TokensDTO;

  constructor(data: RegisteredAccountDomainInterface) {
    this.account = new AccountDTO(data.account);
    this.tokens = data.tokens;
  }
}
