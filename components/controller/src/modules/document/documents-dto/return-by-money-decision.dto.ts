import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, IsNumber } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';

type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id'>;

type action = Cooperative.Registry.ReturnByMoneyDecision.Action;

@InputType('BaseReturnByMoneyDecisionMetaDocumentInput')
class BaseReturnByMoneyDecisionMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'ID решения совета' })
  @IsNumber()
  decision_id!: number;

  @Field({ description: 'Хэш платежа' })
  @IsString()
  payment_hash!: string;

  @Field({ description: 'Сумма к возврату' })
  @IsString()
  amount!: string;

  @Field({ description: 'Валюта' })
  @IsString()
  currency!: string;
}

@InputType('ReturnByMoneyDecisionGenerateDocumentInput')
export class ReturnByMoneyDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseReturnByMoneyDecisionMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType('ReturnByMoneyDecisionSignedMetaDocumentInput')
export class ReturnByMoneyDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseReturnByMoneyDecisionMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType('ReturnByMoneyDecisionSignedDocumentInput')
export class ReturnByMoneyDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ReturnByMoneyDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа решения совета о возврате паевого взноса',
  })
  public readonly meta!: ReturnByMoneyDecisionSignedMetaDocumentInputDTO;
}
