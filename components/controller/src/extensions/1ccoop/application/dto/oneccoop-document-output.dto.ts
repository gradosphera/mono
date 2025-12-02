import { Field, ObjectType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * DTO выходных данных документа 1CCoop
 * data представлен как JSON для универсальности
 */
@ObjectType('OneCoopDocumentOutput')
export class OneCoopDocumentOutputDTO {
  @Field(() => String, {
    description: 'Тип действия документа',
  })
  action!: string;

  @Field(() => Int, {
    description: 'Номер блока, в котором документ был зафиксирован',
  })
  block_num!: number;

  @Field(() => String, {
    description: 'SHA-256 хеш пакета документов',
  })
  package!: string;

  @Field(() => String, {
    description: 'SHA-256 хеш основного документа',
  })
  hash!: string;

  @Field(() => GraphQLJSON, {
    description: 'Специфичные данные для конкретного типа действия',
  })
  data!: Record<string, unknown>;
}
