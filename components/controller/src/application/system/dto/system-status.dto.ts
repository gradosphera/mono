import { registerEnumType } from '@nestjs/graphql';

// Определяем GraphQL Enum
export enum SystemStatus {
  install = 'install',
  active = 'active',
  maintenance = 'maintenance',
}

// Регистрируем Enum для использования в GraphQL
registerEnumType(SystemStatus, {
  name: 'SystemStatus',
  description: 'Состояние контроллера кооператива',
});
