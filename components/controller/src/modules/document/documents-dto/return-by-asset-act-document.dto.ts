import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested, IsNotEmpty, IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { SignedDigitalDocumentBase } from '~/modules/document/dto/signed-digital-document.base';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.ReturnByAssetAct.Action;

@InputType(`BaseReturnByAssetActMetaDocumentInput`)
class BaseReturnByAssetActMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  @IsNumber()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  @IsNumber()
  decision_id!: number;

  @Field({ description: 'Идентификатор акта' })
  @IsNotEmpty()
  @IsString()
  act_id!: string;

  @Field({ description: 'Имя аккаунта получателя на кооперативном участке' })
  @IsNotEmpty()
  @IsString()
  transmitter!: string;

  @Field({ description: 'Имя аккаунта кооперативного участка', nullable: true })
  @IsOptional()
  @IsString()
  braname?: string;
}

@ObjectType(`BaseReturnByAssetActMetaDocumentOutput`)
class BaseReturnByAssetActMetaDocumentOutputDTO {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  @IsNumber()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  @IsNumber()
  decision_id!: number;

  @Field({ description: 'Идентификатор акта' })
  @IsNotEmpty()
  @IsString()
  act_id!: string;

  @Field({ description: 'Имя аккаунта получателя на кооперативном участке' })
  @IsNotEmpty()
  @IsString()
  transmitter!: string;

  @Field({ description: 'Имя аккаунта кооперативного участка', nullable: true })
  @IsOptional()
  @IsString()
  braname?: string;
}

@InputType(`ReturnByAssetActGenerateDocumentInput`)
export class ReturnByAssetActGenerateDocumentInputDTO
  extends IntersectionType(
    BaseReturnByAssetActMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`ReturnByAssetActSignedMetaDocumentInput`)
export class ReturnByAssetActSignedMetaDocumentInputDTO
  extends IntersectionType(BaseReturnByAssetActMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ReturnByAssetActSignedDocumentInput`)
export class ReturnByAssetActSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ReturnByAssetActSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: ReturnByAssetActSignedMetaDocumentInputDTO;
}

@ObjectType(`ReturnByAssetActMetaDocumentOutput`)
export class ReturnByAssetActMetaDocumentOutputDTO extends IntersectionType(
  BaseReturnByAssetActMetaDocumentOutputDTO,
  MetaDocumentDTO
) {}

@ObjectType(`ReturnByAssetActSignedDocument`)
export class ReturnByAssetActSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => ReturnByAssetActMetaDocumentOutputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public override readonly meta!: ReturnByAssetActMetaDocumentOutputDTO;
}

@ObjectType(`ReturnByAssetActDocument`)
export class ReturnByAssetActDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => ReturnByAssetActMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: ReturnByAssetActMetaDocumentOutputDTO;
}

@ObjectType('ReturnByAssetActDocumentAggregate')
export class ReturnByAssetActDocumentAggregateDTO
  implements DocumentAggregateDomainInterface<ReturnByAssetActMetaDocumentOutputDTO>
{
  @Field(() => String)
  hash!: string;

  @Field(() => [ReturnByAssetActSignedDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnByAssetActSignedDocumentDTO)
  signatures!: ReturnByAssetActSignedDocumentDTO[];

  @Field(() => ReturnByAssetActDocumentDTO, { nullable: true })
  rawDocument?: ReturnByAssetActDocumentDTO;
}
