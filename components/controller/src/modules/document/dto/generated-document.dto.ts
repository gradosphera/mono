import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, IsObject } from 'class-validator';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GraphQLJSON } from 'graphql-type-json';
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

  @Field(() => GraphQLJSON, { description: 'Метаданные документа' })
  meta!: any;

  @Field(() => String, { description: 'Бинарное содержимое документа (base64)' })
  @IsObject()
  binary!: string;
}
