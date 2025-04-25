import { Field, ObjectType } from '@nestjs/graphql';
import type { SignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';
import { UserDataUnion } from '../unions/user.union';
import GraphQLJSON from 'graphql-type-json';
import { IsString } from 'class-validator';

@ObjectType('SignedDigitalDocument')
export class SignedDigitalDocumentDTO implements SignedDocumentDomainInterface {
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

  @Field(() => Boolean)
  public readonly is_valid!: boolean;

  @Field(() => UserDataUnion, { nullable: true })
  public readonly signer!: typeof UserDataUnion | null;
}
