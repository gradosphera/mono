import { registerEnumType } from '@nestjs/graphql';

export enum Country {
  Russia = 'Russia',
}
registerEnumType(Country, { name: 'Country', description: 'Страна регистрации пользователя' });
