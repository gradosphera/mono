import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ExpenseMechanics } from '../../domain/enums/expense-mechanics.enum';
import { ExpenseRecipientType } from '../../domain/enums/expense-recipient-type.enum';

@InputType('ExpenseItemInput')
export class ExpenseItemInputDTO {
  @Field(() => String, { description: 'Хеш строки расхода (детерминированный, из UI).' })
  @IsNotEmpty()
  @IsString()
  item_hash!: string;

  @Field(() => ExpenseMechanics, { description: 'Способ оплаты (ADVANCE / DIRECT).' })
  @IsEnum(ExpenseMechanics)
  mechanics!: ExpenseMechanics;

  @Field(() => ExpenseRecipientType, { description: 'Тип получателя.' })
  @IsEnum(ExpenseRecipientType)
  recipient_type!: ExpenseRecipientType;

  @Field(() => String, { description: 'Получатель (username / eosio::name организации).' })
  @IsNotEmpty()
  @IsString()
  recipient!: string;

  @Field(() => String, { description: 'Описание назначения расхода.' })
  @IsString()
  description!: string;

  @Field(() => String, { description: 'Планируемая сумма (asset, eg "1000.0000 RUB").' })
  @IsNotEmpty()
  @IsString()
  planned_amount!: string;
}
