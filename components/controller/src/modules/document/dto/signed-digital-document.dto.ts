import { Field, ObjectType } from '@nestjs/graphql';
import type { ExtendedSignedDocumentDomainInterface } from '~/domain/document/interfaces/extended-signed-document-domain.interface';
import type { SignatureInfoDomainInterface } from '~/domain/document/interfaces/extended-signed-document-domain.interface';
import { UserDataUnion } from '../unions/user.union';
import GraphQLJSON from 'graphql-type-json';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { SignedDocumentDomainEntity } from '~/domain/document/entity/signed-document-domain.entity';

@ObjectType('SignatureInfo')
export class SignatureInfoDTO implements SignatureInfoDomainInterface {
  @Field(() => Number)
  public readonly id!: number;

  @Field(() => String)
  @IsString()
  public readonly signer!: string;

  @Field(() => String)
  @IsString()
  public readonly public_key!: string;

  @Field(() => String)
  @IsString()
  public readonly signature!: string;

  @Field(() => String)
  @IsString()
  public readonly signed_at!: string;

  @Field(() => String)
  @IsString()
  public readonly signed_hash!: string;

  @Field(() => GraphQLJSON)
  public readonly meta!: any;

  @Field(() => Boolean, { nullable: true })
  public readonly is_valid?: boolean;

  @Field(() => UserDataUnion, { nullable: true })
  public readonly signer_info?: typeof UserDataUnion | null;
}

@ObjectType('SignedDigitalDocument')
export class SignedDigitalDocumentDTO implements ExtendedSignedDocumentDomainInterface {
  @Field(() => String)
  @IsString()
  public readonly version!: string;

  @Field(() => String)
  @IsString()
  public readonly hash!: string;

  @Field(() => String)
  @IsString()
  public readonly doc_hash!: string;

  @Field(() => String)
  @IsString()
  public readonly meta_hash!: string;

  @Field(() => GraphQLJSON)
  public readonly meta!: any;

  @Field(() => [SignatureInfoDTO])
  @ValidateNested({ each: true })
  @Type(() => SignatureInfoDTO)
  public readonly signatures!: SignatureInfoDTO[];

  constructor(data: ExtendedSignedDocumentDomainInterface) {
    this.version = data.version;
    this.hash = data.hash;
    this.doc_hash = data.doc_hash;
    this.meta_hash = data.meta_hash;
    this.meta = data.meta;
    this.signatures = data.signatures;
  }
}
