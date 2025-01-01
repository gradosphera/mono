import { registerEnumType } from '@nestjs/graphql';

export enum OrganizationType {
  COOP = 'coop',
  OOO = 'ooo',
  OAO = 'oao',
  ZAO = 'zao',
  PAO = 'pao',
  AO = 'ao',
}
registerEnumType(OrganizationType, { name: 'OrganizationType', description: 'Тип юридического лица' });
