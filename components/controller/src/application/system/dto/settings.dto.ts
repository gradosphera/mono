import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import type { SettingsDomainInterface } from '~/domain/settings/interfaces/settings-domain.interface';
import type { UpdateSettingsInputDomainInterface } from '~/domain/settings/interfaces/update-settings-input-domain.interface';

/**
 * DTO для настроек системы
 * Используется для отображения настроек в GraphQL API
 */
@ObjectType('Settings')
export class SettingsDTO implements SettingsDomainInterface {
  @Field(() => String, { description: 'Название кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Рабочий стол по умолчанию для авторизованных пользователей' })
  @IsString()
  authorized_default_workspace!: string;

  @Field(() => String, { description: 'Маршрут по умолчанию для авторизованных пользователей' })
  @IsString()
  authorized_default_route!: string;

  @Field(() => String, { description: 'Рабочий стол по умолчанию для неавторизованных пользователей' })
  @IsString()
  non_authorized_default_workspace!: string;

  @Field(() => String, { description: 'Маршрут по умолчанию для неавторизованных пользователей' })
  @IsString()
  non_authorized_default_route!: string;

  @Field(() => Date, { description: 'Дата создания' })
  created_at!: Date;

  @Field(() => Date, { description: 'Дата последнего обновления' })
  updated_at!: Date;

  constructor(data: SettingsDomainInterface) {
    this.coopname = data.coopname;
    this.authorized_default_workspace = data.authorized_default_workspace;
    this.authorized_default_route = data.authorized_default_route;
    this.non_authorized_default_workspace = data.non_authorized_default_workspace;
    this.non_authorized_default_route = data.non_authorized_default_route;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}

/**
 * DTO для обновления настроек системы
 * Все поля опциональны для частичного обновления
 */
@InputType('UpdateSettingsInput')
export class UpdateSettingsInputDTO implements UpdateSettingsInputDomainInterface {
  @Field(() => String, { nullable: true, description: 'Рабочий стол по умолчанию для авторизованных пользователей' })
  @IsString()
  @IsOptional()
  authorized_default_workspace?: string;

  @Field(() => String, { nullable: true, description: 'Маршрут по умолчанию для авторизованных пользователей' })
  @IsString()
  @IsOptional()
  authorized_default_route?: string;

  @Field(() => String, { nullable: true, description: 'Рабочий стол по умолчанию для неавторизованных пользователей' })
  @IsString()
  @IsOptional()
  non_authorized_default_workspace?: string;

  @Field(() => String, { nullable: true, description: 'Маршрут по умолчанию для неавторизованных пользователей' })
  @IsString()
  @IsOptional()
  non_authorized_default_route?: string;
}
