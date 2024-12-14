import { Field, InputType } from '@nestjs/graphql';
import { IsJSON, IsString } from 'class-validator';
import type { Cooperative } from 'cooptypes';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';

@InputType('SignedDigitalDocumentInput')
export class SignedDigitalDocumentInputDTO<TMeta> implements Cooperative.Document.ISignedDocument {
  @Field(() => String, { description: 'Хэш документа' })
  @IsString()
  public readonly hash!: string;

  @Field(() => String, { description: 'Публичный ключ документа' })
  @IsString()
  public readonly public_key!: string;

  @Field(() => String, { description: 'Подпись документа' })
  @IsString()
  public readonly signature!: string;

  @Field(() => MetaDocumentInputDTO, { description: 'Метаинформация документа' })
  @IsJSON()
  public readonly meta!: MetaDocumentInputDTO;

  constructor(data: SignedDigitalDocumentInputDTO<TMeta>) {
    Object.assign(this, data);
  }
}
