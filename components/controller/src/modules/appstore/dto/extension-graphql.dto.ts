// modules/appstore/dto/extension-graphql.dto.ts
import { ObjectType, Field } from '@nestjs/graphql';
import type { ExtensionDomainInterface } from '~/domain/extension/interfaces/extension-domain.interface';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType('Extension')
export class ExtensionDTO<TConfig = any> implements ExtensionDomainInterface {
  @Field(() => String, { description: 'Уникальное имя расширения' })
  name: string;

  @Field(() => Boolean, { description: 'Показывает, доступно ли расширение' })
  available: boolean;

  @Field(() => Boolean, { description: 'Показывает, установлено ли расширение' })
  installed: boolean;

  @Field(() => Boolean, { description: 'Показывает, включено ли расширение' })
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Настройки конфигурации для расширения' })
  config: TConfig;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'Схема настроек конфигурации для расширения',
  })
  schema?: any;

  @Field(() => String, {
    nullable: true,
    description: 'Заголовок расширения',
  })
  title: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание расширения',
  })
  description: any;

  @Field(() => String, {
    nullable: true,
    description: 'Изображение для расширения',
  })
  image: string;

  @Field(() => [String], { description: 'Массив тегов для расширения' })
  tags: string[];

  @Field(() => String, { description: 'Поле подробного текстового описания' })
  readme: string;

  @Field(() => String, { description: 'Поле инструкция для установки' })
  instructions: string;

  @Field(() => Date, { description: 'Дата создания расширения' })
  created_at: Date;

  @Field(() => Date, { description: 'Дата последнего обновления расширения' })
  updated_at: Date;

  constructor(
    name: string,
    available: boolean,
    installed: boolean,
    enabled: boolean,
    config: TConfig,
    created_at: Date,
    updated_at: Date,
    schema: any,
    title: string,
    description: string,
    image: string,
    tags: string[],
    readme: string,
    instructions: string
  ) {
    this.name = name;
    this.available = available;
    this.installed = installed;
    this.enabled = enabled;
    this.config = config;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.schema = schema;
    this.title = title;
    this.description = description;
    this.image = image;
    this.tags = tags;
    this.readme = readme;
    this.instructions = instructions;
  }
}
