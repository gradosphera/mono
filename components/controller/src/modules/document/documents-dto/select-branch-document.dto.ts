import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';

// утилита для выборки повторяющихся параметров из базовых интерфейсов
type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id'>;

// интерфейс параметров для генерации
type action = Cooperative.Registry.SelectBranchStatement.Action;

@InputType(`BaseSelectBranchMetaDocumentInput`)
class BaseSelectBranchMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор имени аккаунта кооперативного участка' })
  @IsString()
  braname!: string;
}

@InputType(`SelectBranchGenerateDocumentInput`)
export class SelectBranchGenerateDocumentInputDTO
  extends IntersectionType(
    BaseSelectBranchMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`SelectBranchSignedMetaDocumentInput`)
export class SelectBranchSignedMetaDocumentInputDTO
  extends IntersectionType(BaseSelectBranchMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`SelectBranchSignedDocumentInput`)
export class SelectBranchSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => SelectBranchSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа выбора кооперативного участка',
  })
  public readonly meta!: SelectBranchSignedMetaDocumentInputDTO;
}
