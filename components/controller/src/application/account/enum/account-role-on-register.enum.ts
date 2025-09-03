import { registerEnumType } from '@nestjs/graphql';

export enum RegisterRole {
  User = 'user',
}
registerEnumType(RegisterRole, { name: 'RegisterRole', description: 'Роль пользователя при регистрации' });
