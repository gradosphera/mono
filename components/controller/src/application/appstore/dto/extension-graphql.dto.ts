// ========== ./dto/extension-graphql.dto.ts ==========
import { ObjectType, Field } from '@nestjs/graphql';
import type { ExtensionDomainInterface } from '~/domain/extension/interfaces/extension-domain.interface';
import { GraphQLJSON } from 'graphql-type-json';
import type { IRegistryExtension } from '~/extensions/extensions.registry';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';

/**
 * ГрафQL-DTO, которое возвращается из резолвера при запросе данных по расширению.
 * Оно реализует ExtensionDomainInterface, но содержит и дополнительные поля (title, tags...).
 */
@ObjectType('Extension')
export class ExtensionDTO<TConfig = any> implements Omit<IRegistryExtension, 'readme' | 'instructions' | 'class'> {
  @Field(() => String, { description: 'Уникальное имя расширения' })
  name: string;

  @Field(() => Boolean, { description: 'Показывает, доступно ли расширение' })
  is_available: boolean;

  @Field(() => Boolean, { description: 'Показывает, рабочий стол ли это' })
  is_desktop: boolean;

  @Field(() => Boolean, { description: 'Показывает, встроенное ли это расширение' })
  is_builtin: boolean;

  @Field(() => Boolean, { description: 'Показывает, внутреннее ли это расширение' })
  is_internal: boolean;

  @Field(() => String, { description: 'Внешняя ссылка на iframe-интерфейс расширения', nullable: true })
  external_url: string | undefined;

  @Field(() => Boolean, { description: 'Показывает, установлено ли расширение' })
  is_installed: boolean;

  @Field(() => Boolean, { description: 'Показывает, включено ли расширение' })
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Настройки конфигурации для расширения' })
  config: TConfig;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Схема настроек конфигурации для расширения' })
  schema: any;

  @Field(() => String, { nullable: true, description: 'Заголовок расширения' })
  title: string;

  @Field(() => String, { nullable: true, description: 'Описание расширения' })
  description: string;

  @Field(() => String, { nullable: true, description: 'Изображение для расширения' })
  image: string;

  @Field(() => [String], { description: 'Массив тегов для расширения' })
  tags: string[];

  @Field(() => String, { description: 'Поле подробного текстового описания (README)' })
  readme: string;

  @Field(() => String, { description: 'Поле инструкция для установки (INSTALL)' })
  instructions: string;

  @Field(() => Date, { description: 'Дата создания расширения' })
  created_at: Date;

  @Field(() => Date, { description: 'Дата последнего обновления расширения' })
  updated_at: Date;
  constructor(name: string, registryData: IRegistryExtension, installedExtension: ExtensionDomainEntity<TConfig> | null) {
    this.name = name;
    this.is_available = registryData.is_available;
    this.is_internal = registryData.is_internal;
    this.external_url = registryData.external_url;
    this.is_builtin = registryData.is_builtin;
    this.is_installed = !!installedExtension;
    this.is_desktop = registryData.is_desktop;
    this.enabled = installedExtension?.enabled ?? false;
    this.config = installedExtension?.config ?? ({} as TConfig);
    this.created_at = installedExtension?.created_at ?? new Date(0);
    this.updated_at = installedExtension?.updated_at ?? new Date(0);
    this.schema = registryData.schema ?? null;
    this.title = registryData.title ?? '';
    this.description = registryData.description ?? '';
    this.image = registryData.image ?? '';
    this.tags = registryData.tags ?? [];
    this.readme = '';
    this.instructions = '';
  }
}
