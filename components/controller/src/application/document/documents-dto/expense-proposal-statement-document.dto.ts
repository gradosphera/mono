import { InputType, Field, IntersectionType, OmitType, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/application/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/application/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/application/document/dto/signed-digital-document-input.dto';

type Action = Cooperative.Registry.ExpenseProposalStatement.Action;
type ItemAction = Cooperative.Registry.ExpenseProposalStatement.IExpenseItem;
type HeaderAction = Cooperative.Registry.ExpenseProposalStatement.IExpenseProposalHeader;

@InputType('ExpenseProposalItemInput')
class ExpenseProposalItemInputDTO implements ItemAction {
  @Field({ description: 'Порядковый номер строки' })
  @IsString()
  number!: string;

  @Field({ description: 'Описание расхода' })
  @IsString()
  description!: string;

  @Field({ description: 'Сумма строки' })
  @IsString()
  amount!: string;

  @Field({ description: 'Тип получателя (SELF / MEMBER / ORG)' })
  @IsString()
  recipient_type!: 'SELF' | 'MEMBER' | 'ORG';

  @Field({ description: 'Способ оплаты (ADVANCE / DIRECT)' })
  @IsString()
  mechanics!: 'ADVANCE' | 'DIRECT';

  @Field({ description: 'Имя получателя', nullable: true })
  @IsOptional()
  @IsString()
  recipient_name?: string;

  @Field({ description: 'Реквизиты получателя', nullable: true })
  @IsOptional()
  @IsString()
  requisites?: string;
}

@InputType('ExpenseProposalHeaderInput')
class ExpenseProposalHeaderInputDTO implements HeaderAction {
  @Field({ description: 'Описание цели расходов' })
  @IsString()
  description!: string;

  @Field({ description: 'Итоговая сумма расходов' })
  @IsString()
  total_amount!: string;

  @Field(() => Int, { description: 'Количество позиций' })
  @IsInt()
  items_count!: number;

  @Field({ description: 'Кошелёк-источник' })
  @IsString()
  source_wallet!: string;
}

@InputType('BaseExpenseProposalStatementMetaDocumentInput')
class BaseExpenseProposalStatementMetaDocumentInputDTO implements Omit<Action, 'coopname' | 'username' | 'registry_id' | 'block_num' | 'lang' | 'title' | 'generator' | 'version' | 'created_at' | 'timezone' | 'links'> {
  @Field({ description: 'Хеш сметы расхода (детерминированный)' })
  @IsString()
  @IsNotEmpty()
  proposal_hash!: string;

  @Field(() => ExpenseProposalHeaderInputDTO, { description: 'Шапка СЗ' })
  @ValidateNested()
  @Type(() => ExpenseProposalHeaderInputDTO)
  proposal!: ExpenseProposalHeaderInputDTO;

  @Field(() => [ExpenseProposalItemInputDTO], { description: 'Позиции расхода' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExpenseProposalItemInputDTO)
  items!: ExpenseProposalItemInputDTO[];
}

/**
 * Input генерации документа СЗ-заявления (registry 2010).
 * Backend через factory собирает PDF, возвращает `IGeneratedDocument` (без подписей).
 */
@InputType('ExpenseProposalStatementGenerateDocumentInput')
export class ExpenseProposalStatementGenerateDocumentInputDTO extends IntersectionType(
  BaseExpenseProposalStatementMetaDocumentInputDTO,
  OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
) {
  registry_id!: number;
}

@InputType('ExpenseProposalStatementSignedMetaDocumentInput')
export class ExpenseProposalStatementSignedMetaDocumentInputDTO extends IntersectionType(
  BaseExpenseProposalStatementMetaDocumentInputDTO,
  MetaDocumentInputDTO
) {}

/**
 * Подписанный документ СЗ-заявления (registry 2010).
 */
@InputType('ExpenseProposalStatementSignedDocumentInput')
export class ExpenseProposalStatementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ExpenseProposalStatementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация СЗ-заявления',
  })
  public readonly meta!: ExpenseProposalStatementSignedMetaDocumentInputDTO;
}
