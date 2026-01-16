import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/application/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

// утилита для выборки повторяющихся параметров из базовых интерфейсов
type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id'>;

// интерфейс параметров для генерации
type action = Cooperative.Registry.GenerationAgreement.Action;

@InputType(`BaseGenerationAgreementMetaDocumentInput`)
class BaseGenerationAgreementMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Хэш участника для генерации соглашения' })
  @IsString()
  contributor_hash!: string;
}

@InputType(`GenerationAgreementGenerateDocumentInput`)
export class GenerationAgreementGenerateDocumentInputDTO extends IntersectionType(
  BaseGenerationAgreementMetaDocumentInputDTO,
  OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
) {
  registry_id!: number;
}

@InputType(`GenerationAgreementSignedMetaDocumentInput`)
export class GenerationAgreementSignedMetaDocumentInputDTO extends IntersectionType(
  BaseGenerationAgreementMetaDocumentInputDTO,
  MetaDocumentInputDTO
) {}

@InputType(`GenerationAgreementSignedDocumentInput`)
export class GenerationAgreementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => GenerationAgreementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа договора участия в хозяйственной деятельности',
  })
  public readonly meta!: GenerationAgreementSignedMetaDocumentInputDTO;
}
