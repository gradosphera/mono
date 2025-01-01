import { registerEnumType } from '@nestjs/graphql';

export enum AccountType {
  Individual = 'individual',
  Entrepreneur = 'entrepreneur',
  Organization = 'organization',
}
registerEnumType(AccountType, { name: 'AccountType', description: 'Тип аккаунта пользователя в системе' });
