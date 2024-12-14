import { IsString, IsNumber, IsArray, IsDateString, IsInt, IsEnum } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';
import { LangType } from './lang-type.enum';
import type { Cooperative } from 'cooptypes';

@InputType('MetaDocumentInput')
export class MetaDocumentInputDTO implements Cooperative.Document.IMetaDocument {
  @Field({ description: 'Название документа' })
  @IsString()
  title!: string;

  @Field(() => Int, { description: 'ID в реестре, связанный с документом' })
  @IsNumber()
  registry_id!: number;

  @Field(() => String, { description: 'Язык документа' })
  @IsEnum(LangType)
  lang!: LangType;

  @Field({ description: 'Имя генератора, использованного для создания документа' })
  @IsString()
  generator!: string;

  @Field({ description: 'Версия генератора, использованного для создания документа' })
  @IsString()
  version!: string;

  @Field({ description: 'Название кооператива, связанное с документом' })
  @IsString()
  coopname!: string;

  @Field({ description: 'Имя пользователя, создавшего документ' })
  @IsString()
  username!: string;

  @Field({ description: 'Дата и время создания документа' })
  @IsDateString()
  created_at!: string;

  @Field(() => Int, { description: 'Номер блока, на котором был создан документ' })
  @IsInt()
  block_num!: number;

  @Field({ description: 'Часовой пояс, в котором был создан документ' })
  @IsString()
  timezone!: string;

  @Field(() => [String], { description: 'Ссылки, связанные с документом' })
  @IsArray()
  @IsString({ each: true })
  links!: string[];
}
