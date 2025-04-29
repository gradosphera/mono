import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
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
