// signed-digital-document.base.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
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

  @Field(() => GraphQLJSON)
  public readonly meta!: any;

  constructor(data: SignedDigitalDocumentBase) {
    Object.assign(this, data);
  }
}
