import { registerEnumType } from '@nestjs/graphql';

export enum AccountType {
  individual = 'individual',
  entrepreneur = 'entrepreneur',
  organization = 'organization',
}
registerEnumType(AccountType, { name: 'AccountType', description: 'Тип аккаунта пользователя в системе' });
