import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { SignedDigitalDocumentBase } from '~/modules/document/dto/signed-digital-document.base';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.ParticipantApplication.Action;

@InputType(`BaseParticipantApplicationMetaDocumentInput`)
class BaseParticipantApplicationMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Изображение собственноручной подписи (base-64)' })
  @IsString()
  signature!: string;

  @Field({ description: 'Имя аккаунта кооперативного участка' })
  @IsOptional()
  braname?: string;

  @Field({
    description:
      'Флаг пропуска сохранения документа (используется для предварительной генерации и демонстрации пользователю)',
  })
  @IsBoolean()
  skip_save!: boolean;
}

@ObjectType(`BaseParticipantApplicationMetaDocumentOutput`)
class BaseParticipantApplicationMetaDocumentOutputDTO {}

@InputType(`ParticipantApplicationGenerateDocumentInput`)
export class ParticipantApplicationGenerateDocumentInputDTO
  extends IntersectionType(
    BaseParticipantApplicationMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`ParticipantApplicationSignedMetaDocumentInput`)
export class ParticipantApplicationSignedMetaDocumentInputDTO
  extends IntersectionType(BaseParticipantApplicationMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ParticipantApplicationSignedDocumentInput`)
export class ParticipantApplicationSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ParticipantApplicationSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: ParticipantApplicationSignedMetaDocumentInputDTO;
}

@ObjectType(`ParticipantApplicationMetaDocumentOutput`)
export class ParticipantApplicationMetaDocumentOutputDTO extends IntersectionType(
  BaseParticipantApplicationMetaDocumentOutputDTO,
  MetaDocumentDTO
) {}

@ObjectType(`ParticipantApplicationSignedDocument`)
export class ParticipantApplicationSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => ParticipantApplicationMetaDocumentOutputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public override readonly meta!: ParticipantApplicationMetaDocumentOutputDTO;
}

@ObjectType(`ParticipantApplicationDocument`)
export class ParticipantApplicationDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => ParticipantApplicationMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: ParticipantApplicationMetaDocumentOutputDTO;
}
