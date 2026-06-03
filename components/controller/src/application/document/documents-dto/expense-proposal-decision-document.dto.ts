import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';

/**
 * Meta-обвязка для шаблона 2011 (`ExpenseProposalDecision` — решение совета по СЗ).
 */
@InputType('ExpenseProposalDecisionSignedMetaDocumentInput')
export class ExpenseProposalDecisionSignedMetaDocumentInputDTO extends MetaDocumentInputDTO {
  @Field({ description: 'Хеш сметы расхода (детерминированный)' })
  @IsString()
  @IsNotEmpty()
  proposal_hash!: string;
}

/**
 * Подписанный документ-решение по СЗ (registry 2011).
 * Председатель подписывает payload — сервис сабмитит `expense::authexp`
 * с `decision = this.toDocument()`.
 */
@InputType('ExpenseProposalDecisionSignedDocumentInput')
export class ExpenseProposalDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ExpenseProposalDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация решения по СЗ',
  })
  public readonly meta!: ExpenseProposalDecisionSignedMetaDocumentInputDTO;
}
