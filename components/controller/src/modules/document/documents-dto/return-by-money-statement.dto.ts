import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';

// утилита для выборки повторяющихся параметров из базовых интерфейсов
type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id'>;

// интерфейс параметров для генерации
type action = Cooperative.Registry.ReturnByMoney.Action;

@InputType('RequestInput')
class RequestInputDTO implements Cooperative.Registry.ReturnByMoney.IMoneyReturnRequest {
  @Field({ description: 'ID платежного метода' })
  @IsString()
  method_id!: string;

  @Field({ description: 'Сумма к возврату' })
  @IsString()
  amount!: string;

  @Field({ description: 'Валюта' })
  @IsString()
  currency!: string;
}

@InputType(`BaseReturnByMoneyMetaDocumentInput`)
class BaseReturnByMoneyMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field(() => RequestInputDTO, { description: 'Данные запроса на возврат денежных средств' })
  request!: RequestInputDTO;
}

@InputType(`ReturnByMoneyGenerateDocumentInput`)
export class ReturnByMoneyGenerateDocumentInputDTO
  extends IntersectionType(
    BaseReturnByMoneyMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`ReturnByMoneySignedMetaDocumentInput`)
export class ReturnByMoneySignedMetaDocumentInputDTO
  extends IntersectionType(BaseReturnByMoneyMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ReturnByMoneySignedDocumentInput`)
export class ReturnByMoneySignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ReturnByMoneySignedMetaDocumentInputDTO, {
    description: 'Метаинформация для документа заявления на возврат паевого взноса денежными средствами',
  })
  public readonly meta!: ReturnByMoneySignedMetaDocumentInputDTO;
}
