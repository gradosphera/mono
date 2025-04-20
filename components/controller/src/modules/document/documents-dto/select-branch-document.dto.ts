import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { SignedDigitalDocumentBase } from '~/modules/document/dto/signed-digital-document.base';

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

@ObjectType(`SelectBranchSignedDocument`)
export class SelectBranchSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => SelectBranchMetaDocumentOutputDTO, {
    description: 'Метаинформация для документа выбора кооперативного участка',
  })
  public override readonly meta!: SelectBranchMetaDocumentOutputDTO;
}
@ObjectType(`SelectBranchDocument`)
export class SelectBranchDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => SelectBranchMetaDocumentOutputDTO, {
    description: `Метаинформация для документа выбора кооперативного участка`,
  })
  @ValidateNested()
  public readonly meta!: SelectBranchMetaDocumentOutputDTO;
}

@ObjectType('SelectBranchDocumentAggregate')
export class SelectBranchDocumentAggregateDTO
  implements DocumentAggregateDomainInterface<SelectBranchMetaDocumentOutputDTO>
{
  @Field(() => String)
  hash!: string;

  @Field(() => [SelectBranchSignedDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectBranchSignedDocumentDTO)
  signatures!: SelectBranchSignedDocumentDTO[];

  @Field(() => SelectBranchDocumentDTO, { nullable: true })
  rawDocument?: SelectBranchDocumentDTO;
}
