import { ObjectType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsObject } from 'class-validator';
import { MetaDocumentDTO } from './meta-document.dto';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';

@ObjectType('GeneratedDocument')
export class GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field({ description: 'Полное название документа' })
  @IsString()
  full_title!: string;

  @Field({ description: 'HTML содержимое документа' })
  @IsString()
  html!: string;

  @Field({ description: 'Хэш документа' })
  @IsString()
  hash!: string;

  @Field(() => MetaDocumentDTO, { description: 'Метаданные документа' })
  @ValidateNested()
  @Type(() => MetaDocumentDTO)
  meta!: MetaDocumentDTO;

  @Field(() => String, { description: 'Бинарное содержимое документа (base64)' })
  @IsObject()
  binary!: string;
}
