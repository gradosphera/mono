import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/application/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

// утилита для выборки повторяющихся параметров из базовых интерфейсов
type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id' | 'block_num' | 'lang'>;

// интерфейс параметров для генерации
type action = Cooperative.Registry.ComponentGenerationAgreement.Action;

@InputType(`BaseComponentGenerationAgreementMetaDocumentInput`)
class BaseComponentGenerationAgreementMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Хэш компонента (проекта)' })
  @IsString()
  @IsNotEmpty()
  component_hash!: string;

  @Field({ description: 'Хэш родительского проекта' })
  @IsString()
  @IsNotEmpty()
  parent_project_hash!: string;
}

@InputType(`ComponentGenerationAgreementGenerateDocumentInput`)
export class ComponentGenerationAgreementGenerateDocumentInputDTO extends IntersectionType(
  BaseComponentGenerationAgreementMetaDocumentInputDTO,
  OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
) {
  registry_id!: number;
}

@InputType(`ComponentGenerationAgreementSignedMetaDocumentInput`)
export class ComponentGenerationAgreementSignedMetaDocumentInputDTO extends IntersectionType(
  BaseComponentGenerationAgreementMetaDocumentInputDTO,
  MetaDocumentInputDTO
) {
  @Field({ description: 'Хэш дополнения к приложению (для компонента)' })
  @IsString()
  component_appendix_hash!: string;

  @Field({ description: 'Хэш родительского приложения (к родительскому проекту)' })
  @IsString()
  parent_appendix_hash!: string;

  @Field({ description: 'Хэш участника' })
  @IsString()
  contributor_hash!: string;

  @Field({ description: 'Дата создания участника' })
  @IsString()
  contributor_created_at!: string;

  @Field({ description: 'Название компонента' })
  @IsString()
  component_name!: string;

  @Field({ description: 'ID компонента' })
  @IsString()
  component_id!: string;

  @Field({ description: 'Название проекта' })
  @IsString()
  project_name!: string;

  @Field({ description: 'ID проекта' })
  @IsString()
  project_id!: string;
}

@InputType(`ComponentGenerationAgreementSignedDocumentInput`)
export class ComponentGenerationAgreementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ComponentGenerationAgreementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа дополнения к приложению договора участия в хозяйственной деятельности для компонентов',
  })
  public readonly meta!: ComponentGenerationAgreementSignedMetaDocumentInputDTO;
}
