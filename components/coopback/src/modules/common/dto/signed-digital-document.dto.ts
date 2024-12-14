import { Field, ObjectType } from '@nestjs/graphql';
import { IsJSON, IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';

@ObjectType('SignedDigitalDocument')
export class SignedDigitalDocumentDTO<TMeta> implements Cooperative.Document.ISignedDocument {
  @Field(() => String, { description: 'Хеш документа' })
  @IsString()
  public readonly hash!: string;

  @Field(() => String, { description: 'Публичный ключ документа' })
  @IsString()
  public readonly public_key!: string;

  @Field(() => String, { description: 'Подпись документа' })
  @IsString()
  public readonly signature!: string;

  @Field(() => MetaDocumentDTO, { description: 'Метаинформация документа' })
  @IsJSON()
  public readonly meta!: MetaDocumentDTO;

  constructor(data: SignedDigitalDocumentDTO<TMeta>) {
    Object.assign(this, data);
  }
}
