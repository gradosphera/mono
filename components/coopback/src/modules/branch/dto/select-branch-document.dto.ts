import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
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

@ObjectType(`BaseSelectBranchMetaDocumentOutput`)
class BaseSelectBranchMetaDocumentOutputDTO implements ExcludeCommonProps<action> {
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

@ObjectType(`SelectBranchMetaDocumentOutput`)
export class SelectBranchMetaDocumentOutputDTO
  extends IntersectionType(BaseSelectBranchMetaDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`SelectBranchDocument`)
export class SelectBranchDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => SelectBranchMetaDocumentOutputDTO, {
    description: `Метаинформация для документа выбора кооперативного участка`,
  })
  @ValidateNested()
  public readonly meta!: SelectBranchMetaDocumentOutputDTO;
}
