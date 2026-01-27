import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, IsBoolean } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/application/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

// утилита для выборки повторяющихся параметров из базовых интерфейсов
type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id'>;

// интерфейс параметров для генерации
type action = Cooperative.Registry.GenerationToMainWalletConvertStatement.Action;

@InputType(`BaseGenerationToMainWalletConvertStatementMetaDocumentInput`)
class BaseGenerationToMainWalletConvertStatementMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Хэш приложения' })
  @IsString()
  appendix_hash!: string;

  @Field({ description: 'Хэш проекта' })
  @IsString()
  project_hash!: string;

  @Field({ description: 'Сумма для перевода на основной кошелек' })
  @IsString()
  main_wallet_amount!: string;

  @Field({ description: 'Сумма для перевода на благорост кошелек' })
  @IsString()
  blagorost_wallet_amount!: string;

  @Field({ description: 'Перевод на основной кошелек' })
  @IsBoolean()
  to_wallet!: boolean;

  @Field({ description: 'Перевод на благорост кошелек' })
  @IsBoolean()
  to_blagorost!: boolean;
}

@InputType(`GenerationToMainWalletConvertStatementGenerateDocumentInput`)
export class GenerationToMainWalletConvertStatementGenerateDocumentInputDTO extends IntersectionType(
  BaseGenerationToMainWalletConvertStatementMetaDocumentInputDTO,
  OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
) {
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`GenerationToMainWalletConvertStatementSignedMetaDocumentInput`)
export class GenerationToMainWalletConvertStatementSignedMetaDocumentInputDTO
  extends IntersectionType(BaseGenerationToMainWalletConvertStatementMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`GenerationToMainWalletConvertStatementSignedDocumentInput`)
export class GenerationToMainWalletConvertStatementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => GenerationToMainWalletConvertStatementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа заявления о переводе части целевого паевого взноса',
  })
  public readonly meta!: GenerationToMainWalletConvertStatementSignedMetaDocumentInputDTO;
}