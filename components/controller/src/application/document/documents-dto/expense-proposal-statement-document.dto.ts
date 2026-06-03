import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';

/**
 * Meta-обвязка для шаблона 2010 (`ExpenseProposalStatement` — заявление-смета СЗ).
 * Минимальное расширение `MetaDocumentInputDTO` — proposal_hash; остальные параметры
 * (source_wallet, operation_code, items) живут на уровне action, а не meta документа.
 */
@InputType('ExpenseProposalStatementSignedMetaDocumentInput')
export class ExpenseProposalStatementSignedMetaDocumentInputDTO extends MetaDocumentInputDTO {
  @Field({ description: 'Хеш сметы расхода (детерминированный)' })
  @IsString()
  @IsNotEmpty()
  proposal_hash!: string;
}

/**
 * Подписанный документ СЗ-заявления (registry 2010).
 * Создатель сметы (`username`) подписывает payload, отдаёт сюда — сервис
 * сабмитит `expense::createexp` с `statement = this.toDocument()`.
 */
@InputType('ExpenseProposalStatementSignedDocumentInput')
export class ExpenseProposalStatementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ExpenseProposalStatementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация СЗ-заявления',
  })
  public readonly meta!: ExpenseProposalStatementSignedMetaDocumentInputDTO;
}
