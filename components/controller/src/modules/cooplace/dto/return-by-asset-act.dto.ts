import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.ReturnByAssetAct.Action;

@InputType(`BaseReturnByAssetActMetaDocumentInput`)
class BaseReturnByAssetActMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  decision_id!: number;

  @Field({ description: 'Идентификатор акта' })
  @IsNotEmpty()
  act_id!: string;

  @Field({ description: 'Имя аккаунта получателя на кооперативном участке' })
  @IsNotEmpty()
  transmitter!: string;

  @Field({ description: 'Имя аккаунта кооперативного участка', nullable: true })
  @IsOptional()
  braname?: string;
}

@ObjectType(`BaseReturnByAssetActMetaDocumentOutput`)
class BaseReturnByAssetActMetaDocumentOutputDTO {}

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

@ObjectType(`ReturnByAssetActDocument`)
export class ReturnByAssetActDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => ReturnByAssetActMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: ReturnByAssetActMetaDocumentOutputDTO;
}
