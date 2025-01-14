import { registerEnumType } from '@nestjs/graphql';

export enum LangType {
  ru = 'ru',
}

registerEnumType(LangType, {
  name: 'LangType', // Имя перечисления в GraphQL схеме
  description: 'Язык документа', // Описание для документации
});
