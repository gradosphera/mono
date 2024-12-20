import { IsOptional, IsString, IsNumber, IsArray, IsInt, IsEnum } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';
import { LangType } from './lang-type.enum';
import type { Cooperative } from 'cooptypes';

@InputType('GenerateMetaDocumentInput')
export class GenerateMetaDocumentInputDTO implements Cooperative.Document.IGenerate {
  @Field({ description: 'Название документа', nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => Int, { description: 'ID документа в реестре' })
  @IsNumber()
  registry_id!: number;

  @Field({ description: 'Название кооператива, связанное с документом' })
  @IsString()
  coopname!: string;

  @Field({ description: 'Имя пользователя, создавшего документ' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Язык документа', nullable: true })
  @IsOptional()
  @IsEnum(LangType)
  lang?: LangType;

  @Field({ description: 'Имя генератора, использованного для создания документа', nullable: true })
  @IsOptional()
  @IsString()
  generator?: string;

  @Field({ description: 'Версия генератора, использованного для создания документа', nullable: true })
  @IsOptional()
  @IsString()
  version?: string;

  @Field(() => String, { description: 'Дата и время создания документа', nullable: true })
  @IsOptional()
  created_at?: string;

  @Field(() => Int, { description: 'Номер блока, на котором был создан документ', nullable: true })
  @IsOptional()
  @IsInt()
  block_num?: number;

  @Field({ description: 'Часовой пояс, в котором был создан документ', nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field(() => [String], { description: 'Ссылки, связанные с документом', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  links?: string[];
}
