import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
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
  @Field(() => ParticipantApplicationSignedMetaDocumentInputDTO)
  public readonly meta!: ParticipantApplicationSignedMetaDocumentInputDTO;
}
