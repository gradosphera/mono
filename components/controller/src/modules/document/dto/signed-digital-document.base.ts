// signed-digital-document.base.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import type { MetaDocumentDTO } from './meta-document.dto';

@ObjectType({ isAbstract: true })
export abstract class SignedDigitalDocumentBase {
  @Field(() => String)
  @IsString()
  public readonly hash!: string;

  @Field(() => String)
  @IsString()
  public readonly public_key!: string;

  @Field(() => String)
  @IsString()
  public readonly signature!: string;

  public readonly meta!: MetaDocumentDTO;

  constructor(data: SignedDigitalDocumentBase) {
    Object.assign(this, data);
  }
}
