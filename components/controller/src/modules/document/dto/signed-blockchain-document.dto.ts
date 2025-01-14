import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import type { Cooperative } from 'cooptypes';

@ObjectType('SignedBlockchainDocument')
export class SignedBlockchainDocumentDTO implements Cooperative.Document.IChainDocument {
  @Field(() => String, { description: 'Хеш документа' })
  @IsString()
  public readonly hash!: string;

  @Field(() => String, { description: 'Публичный ключ документа' })
  @IsString()
  public readonly public_key!: string;

  @Field(() => String, { description: 'Подпись документа' })
  @IsString()
  public readonly signature!: string;

  @Field(() => String, { description: 'Метаинформация документа' })
  @IsString()
  public readonly meta!: string;

  constructor(data?: SignedBlockchainDocumentDTO) {
    if (!data) return;

    Object.assign(this, data);
  }
}
