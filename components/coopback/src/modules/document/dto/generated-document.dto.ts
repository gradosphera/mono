import { ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { MetaDocumentDTO } from './meta-document.dto';

@ObjectType('GeneratedDocument')
export class GeneratedDocumentDTO {
  @IsOptional()
  @IsString()
  full_title?: string;

  @IsString()
  html!: string;

  @IsString()
  hash!: string;

  @ValidateNested()
  @Type(() => MetaDocumentDTO)
  meta!: MetaDocumentDTO;

  @IsObject()
  binary!: Uint8Array;
}
