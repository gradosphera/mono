import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsString, IsBoolean, IsNumber, IsArray, IsOptional } from 'class-validator';
import { AccountType } from '~/application/account/enum/account-type.enum';
import type { IRegistrationProgram } from '~/domain/registration/config/agreement-config.interface';

/**
 * DTO для описания программы регистрации
 */
@ObjectType('RegistrationProgram')
export class RegistrationProgramDTO {
  @Field({ description: 'Уникальный ключ программы' })
  @IsString()
  key!: string;

  @Field({ description: 'Название программы для отображения' })
  @IsString()
  title!: string;

  @Field({ description: 'Описание программы' })
  @IsString()
  description!: string;

  @Field({ nullable: true, description: 'URL изображения (опционально)' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @Field({ nullable: true, description: 'Минимальные требования для участия' })
  @IsString()
  @IsOptional()
  requirements?: string;

  @Field(() => [AccountType], { description: 'Для каких типов аккаунтов доступна программа' })
  @IsArray()
  applicable_account_types!: AccountType[];

  @Field(() => Int, { description: 'Порядок отображения' })
  @IsNumber()
  order!: number;

  constructor(data?: IRegistrationProgram) {
    if (data) {
      this.key = data.key;
      this.title = data.title;
      this.description = data.description;
      this.image_url = data.image_url;
      this.requirements = data.requirements;
      this.applicable_account_types = data.applicable_account_types;
      this.order = data.order;
    }
  }
}

/**
 * DTO для конфигурации программ регистрации
 */
@ObjectType('RegistrationConfig')
export class RegistrationConfigDTO {
  @Field({ description: 'Нужен ли выбор программы' })
  @IsBoolean()
  requires_selection!: boolean;

  @Field(() => [RegistrationProgramDTO], { description: 'Доступные программы' })
  @IsArray()
  programs!: RegistrationProgramDTO[];

  constructor(data?: { requires_selection: boolean; programs: IRegistrationProgram[] }) {
    if (data) {
      this.requires_selection = data.requires_selection;
      this.programs = data.programs.map((p) => new RegistrationProgramDTO(p));
    }
  }
}
