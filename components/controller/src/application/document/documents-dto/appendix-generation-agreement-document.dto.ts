import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/application/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

// утилита для выборки повторяющихся параметров из базовых интерфейсов
type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id' | 'block_num' | 'lang'>;

// интерфейс параметров для генерации
type action = Cooperative.Registry.AppendixGenerationAgreement.Action;

@InputType(`BaseAppendixGenerationAgreementMetaDocumentInput`)
class BaseAppendixGenerationAgreementMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Хэш проекта' })
  @IsString()
  @IsNotEmpty()
  project_hash!: string;
}

@InputType(`AppendixGenerationAgreementGenerateDocumentInput`)
export class AppendixGenerationAgreementGenerateDocumentInputDTO extends IntersectionType(
  BaseAppendixGenerationAgreementMetaDocumentInputDTO,
  OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
) {
  registry_id!: number;
}

@InputType(`AppendixGenerationAgreementSignedMetaDocumentInput`)
export class AppendixGenerationAgreementSignedMetaDocumentInputDTO extends IntersectionType(
  BaseAppendixGenerationAgreementMetaDocumentInputDTO,
  MetaDocumentInputDTO
) {
  @Field({ description: 'Хэш приложения' })
  @IsString()
  appendix_hash!: string;

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

  @Field({ description: 'Является ли компонентом' })
  @IsBoolean()
  is_component!: boolean;
}

@InputType(`AppendixGenerationAgreementSignedDocumentInput`)
export class AppendixGenerationAgreementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AppendixGenerationAgreementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа приложения к договору участия в хозяйственной деятельности',
  })
  public readonly meta!: AppendixGenerationAgreementSignedMetaDocumentInputDTO;
}
